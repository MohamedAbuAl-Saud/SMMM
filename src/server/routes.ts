import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDb, hashToken, generateRandomCode, generateSessionId, saveDbImmediately, scheduleSaveDb } from './db.ts';
import { DEFAULT_QUESTIONS_POOL } from './defaultQuestions.ts';

export const apiRouter = Router();

// Validation Schemas
const QuizOptionSchema = z.object({
  text: z.string().min(1).max(100).transform(s => s.trim()),
  isCorrect: z.boolean(),
});

const QuizQuestionSchema = z.object({
  questionOrder: z.number().int().min(1).max(20),
  questionText: z.string().min(1).max(200).transform(s => s.trim()),
  options: z.array(QuizOptionSchema).length(4).refine(options => {
    const correctCount = options.filter(o => o.isCorrect).length;
    return correctCount === 1;
  }, { message: 'يجب تحديد إجابة صحيحة واحدة وثلاث إجابات خاطئة لكل سؤال' }),
});

const CreateQuizSchema = z.object({
  creatorName: z.string().min(1, 'الاسم مطلوب').max(45, 'الاسم طويل للغاية').transform(s => s.trim()),
  optionalCountry: z.string().max(50).optional().default(''),
  optionalGender: z.enum(['female', 'male', '']).optional().default(''),
  questions: z.array(QuizQuestionSchema).length(20, 'يجب أن يحتوي الاختبار على 20 سؤالاً بالتمام والكمال'),
});

const StartAttemptSchema = z.object({
  participantName: z.string().min(1, 'الاسم مطلوب').max(45, 'الاسم طويل للغاية').transform(s => s.trim()),
});

const SubmitAnswerSchema = z.object({
  questionId: z.number().int(),
  selectedOptionId: z.number().int(),
});

// 1. Get default pool questions
apiRouter.get('/default-questions', (_req: Request, res: Response) => {
  res.json({ questions: DEFAULT_QUESTIONS_POOL });
});

// 2. Create Quiz
apiRouter.post('/quizzes', async (req: Request, res: Response) => {
  try {
    const parsed = CreateQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' });
    }

    const { creatorName, optionalCountry, optionalGender, questions } = parsed.data;
    const db = await getDb();

    // Generate unique public code
    let publicCode = generateRandomCode(8);
    let attempts = 0;
    while (attempts < 10) {
      const existing = db.exec(`SELECT id FROM quizzes WHERE public_code = '${publicCode}'`);
      if (existing.length === 0 || existing[0].values.length === 0) break;
      publicCode = generateRandomCode(8);
      attempts++;
    }

    const adminToken = generateSessionId();
    const adminTokenHash = hashToken(adminToken);
    const now = new Date().toISOString();

    // Insert Quiz
    db.run(
      `INSERT INTO quizzes (public_code, admin_token_hash, creator_name, optional_country, optional_gender, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [publicCode, adminTokenHash, creatorName, optionalCountry, optionalGender, now, now]
    );

    const quizIdResult = db.exec(`SELECT last_insert_rowid() AS id`);
    const quizId = quizIdResult[0].values[0][0] as number;

    // Insert Questions & Options
    for (const q of questions) {
      db.run(
        `INSERT INTO quiz_questions (quiz_id, question_order, question_text, created_at)
         VALUES (?, ?, ?, ?)`,
        [quizId, q.questionOrder, q.questionText, now]
      );

      const questionIdResult = db.exec(`SELECT last_insert_rowid() AS id`);
      const questionId = questionIdResult[0].values[0][0] as number;

      let optOrder = 1;
      for (const opt of q.options) {
        db.run(
          `INSERT INTO quiz_options (question_id, option_text, option_order, is_correct)
           VALUES (?, ?, ?, ?)`,
          [questionId, opt.text, optOrder, opt.isCorrect ? 1 : 0]
        );
        optOrder++;
      }
    }

    // Log audit event
    db.run(
      `INSERT INTO quiz_events (quiz_id, event_type, details, created_at)
       VALUES (?, 'quiz_created', ?, ?)`,
      [quizId, `Created by ${creatorName}`, now]
    );

    saveDbImmediately();

    return res.status(201).json({
      success: true,
      quizId,
      publicCode,
      adminToken,
      creatorName,
    });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حفظ الاختبار في الخادم' });
  }
});

// 3. Get Public Quiz Details (No answers leaked!)
apiRouter.get('/quizzes/by-code/:publicCode', async (req: Request, res: Response) => {
  try {
    const { publicCode } = req.params;
    const db = await getDb();

    const stmt = db.prepare(`
      SELECT id, public_code, creator_name, optional_country, optional_gender, status, created_at
      FROM quizzes
      WHERE public_code = :code AND status = 'active'
    `);
    stmt.bind({ ':code': publicCode });

    if (!stmt.step()) {
      stmt.free();
      return res.status(404).json({ error: 'الاختبار غير موجود أو تم حذفه' });
    }

    const row = stmt.getAsObject();
    stmt.free();

    // Count participants
    const countStmt = db.prepare(`
      SELECT 
        COUNT(*) AS total_participants,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_participants
      FROM participants
      WHERE quiz_id = :quizId
    `);
    countStmt.bind({ ':quizId': row.id });
    countStmt.step();
    const countRow = countStmt.getAsObject();
    countStmt.free();

    return res.json({
      id: row.id,
      publicCode: row.public_code,
      creatorName: row.creator_name,
      optionalCountry: row.optional_country,
      optionalGender: row.optional_gender,
      createdAt: row.created_at,
      totalParticipants: countRow.total_participants || 0,
      completedParticipants: countRow.completed_participants || 0,
    });
  } catch (error: any) {
    console.error('Error fetching quiz by code:', error);
    return res.status(500).json({ error: 'حدث خطأ في جلب بيانات الاختبار' });
  }
});

// 4. Start Quiz Attempt for a Friend
apiRouter.post('/quizzes/by-code/:publicCode/start', async (req: Request, res: Response) => {
  try {
    const { publicCode } = req.params;
    const parsed = StartAttemptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'اسم المشارك غير صالح' });
    }

    const { participantName } = parsed.data;
    const db = await getDb();

    // Verify Quiz exists
    const qStmt = db.prepare(`SELECT id, creator_name FROM quizzes WHERE public_code = :code AND status = 'active'`);
    qStmt.bind({ ':code': publicCode });
    if (!qStmt.step()) {
      qStmt.free();
      return res.status(404).json({ error: 'الاختبار غير موجود' });
    }
    const quiz = qStmt.getAsObject();
    qStmt.free();

    const quizId = quiz.id as number;

    // Check existing participant cookie / session
    const existingSession = req.cookies?.[`bestie_session_${publicCode}`] || req.headers['x-participant-session'];
    if (existingSession && typeof existingSession === 'string') {
      const pStmt = db.prepare(`
        SELECT id, display_name, status, score
        FROM participants
        WHERE quiz_id = :quizId AND participant_session_id = :sess
      `);
      pStmt.bind({ ':quizId': quizId, ':sess': existingSession });
      if (pStmt.step()) {
        const pObj = pStmt.getAsObject();
        pStmt.free();
        if (pObj.status === 'completed') {
          return res.json({
            alreadyCompleted: true,
            participantId: pObj.id,
            displayName: pObj.display_name,
            score: pObj.score,
          });
        } else {
          // Resume attempt
          return res.json({
            resumed: true,
            participantId: pObj.id,
            displayName: pObj.display_name,
            participantSessionId: existingSession,
          });
        }
      }
      pStmt.free();
    }

    // Compute duplicate name index if multiple participants share the exact same display name
    const dupStmt = db.prepare(`
      SELECT COUNT(*) AS count
      FROM participants
      WHERE quiz_id = :quizId AND display_name LIKE :namePattern
    `);
    dupStmt.bind({ ':quizId': quizId, ':namePattern': `${participantName}%` });
    dupStmt.step();
    const dupCount = (dupStmt.getAsObject().count as number) || 0;
    dupStmt.free();

    const duplicateIndex = dupCount + 1;
    const displayName = duplicateIndex > 1 ? `${participantName} (${duplicateIndex})` : participantName;

    const participantSessionId = generateSessionId();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO participants (quiz_id, participant_session_id, display_name, duplicate_name_index, started_at, status)
       VALUES (?, ?, ?, ?, ?, 'in_progress')`,
      [quizId, participantSessionId, displayName, duplicateIndex, now]
    );

    const partIdResult = db.exec(`SELECT last_insert_rowid() AS id`);
    const participantId = partIdResult[0].values[0][0] as number;

    scheduleSaveDb();

    // Set cookie
    res.cookie(`bestie_session_${publicCode}`, participantSessionId, {
      httpOnly: true,
      secure: false, // development environment
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      participantId,
      participantSessionId,
      displayName,
    });
  } catch (error: any) {
    console.error('Error starting attempt:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء بدء المحاولة' });
  }
});

// Helper to get participant by session
async function getParticipant(publicCode: string, req: Request) {
  const db = await getDb();
  const session = req.cookies?.[`bestie_session_${publicCode}`] || req.headers['x-participant-session'];
  if (!session || typeof session !== 'string') return null;

  const stmt = db.prepare(`
    SELECT p.id, p.quiz_id, p.display_name, p.status, p.score, q.creator_name, q.public_code
    FROM participants p
    JOIN quizzes q ON q.id = p.quiz_id
    WHERE q.public_code = :code AND p.participant_session_id = :sess AND q.status = 'active'
  `);
  stmt.bind({ ':code': publicCode, ':sess': session });
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const participant = stmt.getAsObject();
  stmt.free();
  return participant;
}

// 5. Get Current Question for In-Progress Participant (NO correct answer leaked!)
apiRouter.get('/quizzes/by-code/:publicCode/current-question', async (req: Request, res: Response) => {
  try {
    const { publicCode } = req.params;
    const participant = await getParticipant(publicCode, req);
    if (!participant) {
      return res.status(401).json({ error: 'جلسة المشارك غير موجودة أو منتهية، يرجى كتابة اسمك للبدء' });
    }

    if (participant.status === 'completed') {
      return res.json({ completed: true, score: participant.score });
    }

    const db = await getDb();

    // Find answered question IDs
    const answeredStmt = db.prepare(`
      SELECT question_id FROM participant_answers WHERE participant_id = :pId
    `);
    answeredStmt.bind({ ':pId': participant.id });
    const answeredIds: number[] = [];
    while (answeredStmt.step()) {
      answeredIds.push(answeredStmt.getAsObject().question_id as number);
    }
    answeredStmt.free();

    const currentOrder = answeredIds.length + 1;
    if (currentOrder > 20) {
      return res.json({ completed: true, score: participant.score });
    }

    // Fetch question with order = currentOrder
    const qStmt = db.prepare(`
      SELECT id, question_order, question_text
      FROM quiz_questions
      WHERE quiz_id = :quizId AND question_order = :order
    `);
    qStmt.bind({ ':quizId': participant.quiz_id, ':order': currentOrder });
    if (!qStmt.step()) {
      qStmt.free();
      return res.status(404).json({ error: 'السؤال غير متوفر' });
    }
    const qRow = qStmt.getAsObject();
    qStmt.free();

    // Fetch options - strictly WITHOUT is_correct!
    const optStmt = db.prepare(`
      SELECT id, option_text, option_order
      FROM quiz_options
      WHERE question_id = :qId
      ORDER BY option_order ASC
    `);
    optStmt.bind({ ':qId': qRow.id });
    const options: any[] = [];
    while (optStmt.step()) {
      const o = optStmt.getAsObject();
      options.push({
        id: o.id,
        text: o.option_text,
      });
    }
    optStmt.free();

    // Deterministic or pseudo-random shuffle so order is comfortable but stable
    return res.json({
      completed: false,
      question: {
        id: qRow.id,
        order: qRow.question_order,
        total: 20,
        text: qRow.question_text,
        options,
      },
      answeredCount: answeredIds.length,
      displayName: participant.display_name,
      creatorName: participant.creator_name,
    });
  } catch (error: any) {
    console.error('Error getting current question:', error);
    return res.status(500).json({ error: 'حدث خطأ في تحميل السؤال' });
  }
});

// 6. Submit Answer to Current Question
apiRouter.post('/quizzes/by-code/:publicCode/answer', async (req: Request, res: Response) => {
  try {
    const { publicCode } = req.params;
    const participant = await getParticipant(publicCode, req);
    if (!participant) {
      return res.status(401).json({ error: 'جلسة المشارك غير صالحة' });
    }

    if (participant.status === 'completed') {
      return res.json({ completed: true, score: participant.score });
    }

    const parsed = SubmitAnswerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'بيانات الإجابة غير صالحة' });
    }

    const { questionId, selectedOptionId } = parsed.data;
    const db = await getDb();

    // Validate that questionId belongs to this quiz
    const qCheck = db.prepare(`
      SELECT id, question_order FROM quiz_questions WHERE id = :qId AND quiz_id = :quizId
    `);
    qCheck.bind({ ':qId': questionId, ':quizId': participant.quiz_id });
    if (!qCheck.step()) {
      qCheck.free();
      return res.status(400).json({ error: 'السؤال غير تابع لهذا الاختبار' });
    }
    qCheck.free();

    // Validate that selectedOptionId belongs to this questionId
    const optCheck = db.prepare(`
      SELECT id FROM quiz_options WHERE id = :optId AND question_id = :qId
    `);
    optCheck.bind({ ':optId': selectedOptionId, ':qId': questionId });
    if (!optCheck.step()) {
      optCheck.free();
      return res.status(400).json({ error: 'الخيار غير تابع لهذا السؤال' });
    }
    optCheck.free();

    // Check if already answered
    const existCheck = db.prepare(`
      SELECT id FROM participant_answers WHERE participant_id = :pId AND question_id = :qId
    `);
    existCheck.bind({ ':pId': participant.id, ':qId': questionId });
    if (existCheck.step()) {
      existCheck.free();
      return res.status(409).json({ error: 'تم تسجيل إجابة هذا السؤال بالفعل' });
    }
    existCheck.free();

    // Insert answer
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO participant_answers (participant_id, question_id, selected_option_id, answered_at)
       VALUES (?, ?, ?, ?)`,
      [participant.id, questionId, selectedOptionId, now]
    );

    // Count how many questions answered so far
    const countStmt = db.prepare(`SELECT COUNT(*) AS count FROM participant_answers WHERE participant_id = :pId`);
    countStmt.bind({ ':pId': participant.id });
    countStmt.step();
    const answeredCount = countStmt.getAsObject().count as number;
    countStmt.free();

    if (answeredCount >= 20) {
      // Calculate final score server-side by checking is_correct on quiz_options
      const scoreStmt = db.prepare(`
        SELECT COUNT(*) AS correct_count
        FROM participant_answers pa
        JOIN quiz_options qo ON qo.id = pa.selected_option_id
        WHERE pa.participant_id = :pId AND qo.is_correct = 1
      `);
      scoreStmt.bind({ ':pId': participant.id });
      scoreStmt.step();
      const finalScore = scoreStmt.getAsObject().correct_count as number;
      scoreStmt.free();

      // Mark participant as completed
      db.run(
        `UPDATE participants
         SET status = 'completed', score = ?, completed_at = ?
         WHERE id = ?`,
        [finalScore, now, participant.id]
      );

      saveDbImmediately();

      return res.json({
        completed: true,
        answeredCount: 20,
        score: finalScore,
      });
    } else {
      scheduleSaveDb();
      return res.json({
        completed: false,
        answeredCount,
        remaining: 20 - answeredCount,
      });
    }
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ error: 'حدث خطأ في تسجيل الإجابة' });
  }
});

// 7. Get Friend's Finished Result & Full Breakdown (Only after completion!)
apiRouter.get('/quizzes/by-code/:publicCode/result', async (req: Request, res: Response) => {
  try {
    const { publicCode } = req.params;
    const participant = await getParticipant(publicCode, req);
    if (!participant) {
      return res.status(401).json({ error: 'الجلسة غير صالحة' });
    }

    if (participant.status !== 'completed') {
      return res.status(400).json({ error: 'الاختبار لم يكتمل بعد' });
    }

    const db = await getDb();

    // Fetch all 20 questions, selected option, correct option
    const stmt = db.prepare(`
      SELECT 
        qq.id AS question_id,
        qq.question_order,
        qq.question_text,
        user_opt.id AS selected_option_id,
        user_opt.option_text AS selected_option_text,
        correct_opt.id AS correct_option_id,
        correct_opt.option_text AS correct_option_text,
        (CASE WHEN user_opt.is_correct = 1 THEN 1 ELSE 0 END) AS is_user_correct
      FROM quiz_questions qq
      JOIN participant_answers pa ON pa.question_id = qq.id AND pa.participant_id = :pId
      JOIN quiz_options user_opt ON user_opt.id = pa.selected_option_id
      JOIN quiz_options correct_opt ON correct_opt.question_id = qq.id AND correct_opt.is_correct = 1
      WHERE qq.quiz_id = :quizId
      ORDER BY qq.question_order ASC
    `);
    stmt.bind({ ':pId': participant.id, ':quizId': participant.quiz_id });

    const breakdown: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      breakdown.push({
        questionId: row.question_id,
        questionOrder: row.question_order,
        questionText: row.question_text,
        selectedOptionText: row.selected_option_text,
        correctOptionText: row.correct_option_text,
        isCorrect: row.is_user_correct === 1,
      });
    }
    stmt.free();

    // Rank of this participant
    const rankStmt = db.prepare(`
      SELECT COUNT(*) + 1 AS user_rank
      FROM participants
      WHERE quiz_id = :quizId AND status = 'completed' AND (
        score > :myScore OR (score = :myScore AND completed_at < (
          SELECT completed_at FROM participants WHERE id = :myId
        ))
      )
    `);
    rankStmt.bind({ ':quizId': participant.quiz_id, ':myScore': participant.score, ':myId': participant.id });
    rankStmt.step();
    const rank = rankStmt.getAsObject().user_rank || 1;
    rankStmt.free();

    return res.json({
      participantName: participant.display_name,
      creatorName: participant.creator_name,
      score: participant.score,
      total: 20,
      percentage: Math.round(((participant.score as number) / 20) * 100),
      rank,
      breakdown,
    });
  } catch (error: any) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ error: 'حدث خطأ في جلب النتيجة' });
  }
});

// 8. Public Leaderboard for Quiz
apiRouter.get('/quizzes/by-code/:publicCode/leaderboard', async (req: Request, res: Response) => {
  try {
    const { publicCode } = req.params;
    const db = await getDb();

    // Get quiz
    const qStmt = db.prepare(`SELECT id, creator_name FROM quizzes WHERE public_code = :code AND status = 'active'`);
    qStmt.bind({ ':code': publicCode });
    if (!qStmt.step()) {
      qStmt.free();
      return res.status(404).json({ error: 'الاختبار غير موجود' });
    }
    const quiz = qStmt.getAsObject();
    qStmt.free();

    // Fetch ranked participants
    const stmt = db.prepare(`
      SELECT id, display_name, score, completed_at, duplicate_name_index
      FROM participants
      WHERE quiz_id = :quizId AND status = 'completed'
      ORDER BY score DESC, completed_at ASC, id ASC
    `);
    stmt.bind({ ':quizId': quiz.id });

    const participants: any[] = [];
    let rank = 1;
    while (stmt.step()) {
      const row = stmt.getAsObject();
      participants.push({
        rank,
        id: row.id,
        displayName: row.display_name,
        score: row.score,
        total: 20,
        percentage: Math.round(((row.score as number) / 20) * 100),
        completedAt: row.completed_at,
      });
      rank++;
    }
    stmt.free();

    return res.json({
      creatorName: quiz.creator_name,
      publicCode,
      participants,
      totalCompleted: participants.length,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'حدث خطأ في جلب لوحة المتصدرين' });
  }
});

// 9. Manage Quiz (Owner Dashboard)
apiRouter.get('/quizzes/manage/:quizId', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const adminToken = req.headers['x-admin-token'] || req.query.token;
    if (!adminToken || typeof adminToken !== 'string') {
      return res.status(401).json({ error: 'رمز الإدارة السري مطلوب' });
    }

    const db = await getDb();
    const tokenHash = hashToken(adminToken);

    const qStmt = db.prepare(`
      SELECT id, public_code, creator_name, optional_country, optional_gender, created_at, status
      FROM quizzes
      WHERE id = :id AND admin_token_hash = :hash AND status = 'active'
    `);
    qStmt.bind({ ':id': quizId, ':hash': tokenHash });
    if (!qStmt.step()) {
      qStmt.free();
      return res.status(403).json({ error: 'رمز الإدارة غير صحيح أو تم حذف الاختبار' });
    }
    const quiz = qStmt.getAsObject();
    qStmt.free();

    // Stats
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) AS total_participants,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_participants,
        AVG(CASE WHEN status = 'completed' THEN score ELSE NULL END) AS average_score,
        MAX(CASE WHEN status = 'completed' THEN score ELSE 0 END) AS max_score
      FROM participants
      WHERE quiz_id = :quizId
    `);
    statsStmt.bind({ ':quizId': quizId });
    statsStmt.step();
    const stats = statsStmt.getAsObject();
    statsStmt.free();

    // Participants list
    const pStmt = db.prepare(`
      SELECT id, display_name, score, status, started_at, completed_at
      FROM participants
      WHERE quiz_id = :quizId
      ORDER BY 
        CASE WHEN status = 'completed' THEN 0 ELSE 1 END,
        score DESC,
        completed_at ASC,
        id ASC
    `);
    pStmt.bind({ ':quizId': quizId });

    const participants: any[] = [];
    let rank = 1;
    while (pStmt.step()) {
      const p = pStmt.getAsObject();
      participants.push({
        id: p.id,
        rank: p.status === 'completed' ? rank++ : null,
        displayName: p.display_name,
        score: p.score,
        status: p.status,
        startedAt: p.started_at,
        completedAt: p.completed_at,
        percentage: Math.round(((p.score as number) / 20) * 100),
      });
    }
    pStmt.free();

    return res.json({
      quiz: {
        id: quiz.id,
        publicCode: quiz.public_code,
        creatorName: quiz.creator_name,
        createdAt: quiz.created_at,
      },
      stats: {
        totalParticipants: stats.total_participants || 0,
        completedParticipants: stats.completed_participants || 0,
        averageScore: stats.average_score !== null ? Number(Number(stats.average_score).toFixed(1)) : 0,
        maxScore: stats.max_score || 0,
      },
      participants,
    });
  } catch (error: any) {
    console.error('Error in manage quiz:', error);
    return res.status(500).json({ error: 'حدث خطأ في لوحة التحكم' });
  }
});

// 10. Get Participant Detail for Owner
apiRouter.get('/quizzes/manage/:quizId/participants/:participantId', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const participantId = parseInt(req.params.participantId, 10);
    const adminToken = req.headers['x-admin-token'] || req.query.token;

    if (!adminToken || typeof adminToken !== 'string') {
      return res.status(401).json({ error: 'رمز الإدارة مطلوب' });
    }

    const db = await getDb();
    const tokenHash = hashToken(adminToken);

    // Verify Quiz ownership
    const qStmt = db.prepare(`SELECT id FROM quizzes WHERE id = :id AND admin_token_hash = :hash`);
    qStmt.bind({ ':id': quizId, ':hash': tokenHash });
    if (!qStmt.step()) {
      qStmt.free();
      return res.status(403).json({ error: 'غير مصرح بالوصول' });
    }
    qStmt.free();

    // Verify participant
    const pStmt = db.prepare(`
      SELECT id, display_name, score, status, started_at, completed_at
      FROM participants
      WHERE id = :pId AND quiz_id = :quizId
    `);
    pStmt.bind({ ':pId': participantId, ':quizId': quizId });
    if (!pStmt.step()) {
      pStmt.free();
      return res.status(404).json({ error: 'المشارك غير موجود' });
    }
    const participant = pStmt.getAsObject();
    pStmt.free();

    if (participant.status !== 'completed') {
      return res.json({
        participant,
        message: 'المشارك لم يكمل الاختبار بعد',
        breakdown: [],
      });
    }

    // Breakdown
    const bStmt = db.prepare(`
      SELECT 
        qq.id AS question_id,
        qq.question_order,
        qq.question_text,
        user_opt.option_text AS selected_option_text,
        correct_opt.option_text AS correct_option_text,
        (CASE WHEN user_opt.is_correct = 1 THEN 1 ELSE 0 END) AS is_correct
      FROM quiz_questions qq
      JOIN participant_answers pa ON pa.question_id = qq.id AND pa.participant_id = :pId
      JOIN quiz_options user_opt ON user_opt.id = pa.selected_option_id
      JOIN quiz_options correct_opt ON correct_opt.question_id = qq.id AND correct_opt.is_correct = 1
      WHERE qq.quiz_id = :quizId
      ORDER BY qq.question_order ASC
    `);
    bStmt.bind({ ':pId': participantId, ':quizId': quizId });

    const breakdown: any[] = [];
    while (bStmt.step()) {
      const row = bStmt.getAsObject();
      breakdown.push({
        questionOrder: row.question_order,
        questionText: row.question_text,
        selectedOptionText: row.selected_option_text,
        correctOptionText: row.correct_option_text,
        isCorrect: row.is_correct === 1,
      });
    }
    bStmt.free();

    return res.json({
      participant,
      breakdown,
    });
  } catch (error: any) {
    console.error('Error fetching participant detail:', error);
    return res.status(500).json({ error: 'حدث خطأ في جلب تفاصيل المشارك' });
  }
});

// 11. Delete Quiz (Requires valid admin token)
apiRouter.delete('/quizzes/manage/:quizId', async (req: Request, res: Response) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    const adminToken = req.headers['x-admin-token'] || req.body?.adminToken;

    if (!adminToken || typeof adminToken !== 'string') {
      return res.status(401).json({ error: 'رمز الإدارة السري مطلوب للحذف' });
    }

    const db = await getDb();
    const tokenHash = hashToken(adminToken);

    // Verify ownership
    const qStmt = db.prepare(`SELECT id, public_code FROM quizzes WHERE id = :id AND admin_token_hash = :hash`);
    qStmt.bind({ ':id': quizId, ':hash': tokenHash });
    if (!qStmt.step()) {
      qStmt.free();
      return res.status(403).json({ error: 'رمز الإدارة غير صالح أو الاختبار محذوف بالفعل' });
    }
    const quiz = qStmt.getAsObject();
    qStmt.free();

    // Cascade delete: SQLite foreign keys with PRAGMA foreign_keys = ON handles cascading,
    // or we delete explicitly to ensure zero orphaned data
    db.run(`DELETE FROM participant_answers WHERE participant_id IN (SELECT id FROM participants WHERE quiz_id = ?)`, [quizId]);
    db.run(`DELETE FROM participants WHERE quiz_id = ?`, [quizId]);
    db.run(`DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ?)`, [quizId]);
    db.run(`DELETE FROM quiz_questions WHERE quiz_id = ?`, [quizId]);
    db.run(`DELETE FROM quizzes WHERE id = ?`, [quizId]);

    const now = new Date().toISOString();
    db.run(
      `INSERT INTO quiz_events (quiz_id, event_type, details, created_at)
       VALUES (?, 'quiz_deleted', ?, ?)`,
      [quizId, `Deleted quiz with code ${quiz.public_code}`, now]
    );

    saveDbImmediately();

    return res.json({ success: true, message: 'تم حذف الاختبار وجميع نتائجه بنجاح' });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء حذف الاختبار' });
  }
});

// 12. Batch fetch for "اختباراتي" (client provides array of { quizId, adminToken })
apiRouter.post('/quizzes/my-quizzes', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ quizzes: [] });
    }

    const db = await getDb();
    const validQuizzes: any[] = [];

    for (const item of items) {
      if (!item.quizId || !item.adminToken) continue;
      const tokenHash = hashToken(item.adminToken);

      const qStmt = db.prepare(`
        SELECT id, public_code, creator_name, created_at
        FROM quizzes
        WHERE id = :id AND admin_token_hash = :hash AND status = 'active'
      `);
      qStmt.bind({ ':id': item.quizId, ':hash': tokenHash });

      if (qStmt.step()) {
        const q = qStmt.getAsObject();
        qStmt.free();

        // Count participants
        const cStmt = db.prepare(`
          SELECT 
            COUNT(*) AS total_participants,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_participants
          FROM participants
          WHERE quiz_id = :quizId
        `);
        cStmt.bind({ ':quizId': q.id });
        cStmt.step();
        const cRow = cStmt.getAsObject();
        cStmt.free();

        validQuizzes.push({
          quizId: q.id,
          publicCode: q.public_code,
          creatorName: q.creator_name,
          createdAt: q.created_at,
          adminToken: item.adminToken,
          totalParticipants: cRow.total_participants || 0,
          completedParticipants: cRow.completed_participants || 0,
        });
      } else {
        qStmt.free();
      }
    }

    return res.json({ quizzes: validQuizzes });
  } catch (error: any) {
    console.error('Error fetching my-quizzes:', error);
    return res.status(500).json({ error: 'حدث خطأ في استرجاع الاختبارات' });
  }
});
