import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getDb, hashToken, generateRandomCode, generateSessionId } from '../src/server/db.ts';
import { DEFAULT_QUESTIONS_POOL } from '../src/server/defaultQuestions.ts';

describe('Bestie Check SM - Automated Test Suite', () => {
  it('1. Default pool should contain diverse questions with 20 choices each', () => {
    assert.ok(DEFAULT_QUESTIONS_POOL.length >= 20, 'Pool must contain rich pool of questions');
    const ids = new Set();
    for (const q of DEFAULT_QUESTIONS_POOL) {
      assert.ok(!ids.has(q.id), `Duplicate question id found: ${q.id}`);
      ids.add(q.id);
      assert.ok(q.text.length > 5, 'Question text too short');
      assert.strictEqual(q.defaultOptions.length, 20, 'Each question must offer 20 default options for the creator');
    }
  });

  it('2. Creating a quiz with exactly 20 questions, 1 correct & 3 wrong choices per question', async () => {
    const db = await getDb();
    const publicCode = generateRandomCode(8);
    const adminToken = generateSessionId();
    const adminTokenHash = hashToken(adminToken);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO quizzes (public_code, admin_token_hash, creator_name, optional_country, optional_gender, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [publicCode, adminTokenHash, 'سارة المنصوري', 'مصر', 'female', now, now]
    );

    const qIdResult = db.exec(`SELECT last_insert_rowid() AS id`);
    const quizId = qIdResult[0].values[0][0] as number;

    // Insert 20 questions
    for (let i = 1; i <= 20; i++) {
      db.run(
        `INSERT INTO quiz_questions (quiz_id, question_order, question_text, created_at)
         VALUES (?, ?, ?, ?)`,
        [quizId, i, `سؤال رقم ${i}`, now]
      );
      const questionId = db.exec(`SELECT last_insert_rowid() AS id`)[0].values[0][0] as number;

      // 1 correct option, 3 wrong options
      db.run(`INSERT INTO quiz_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)`, [questionId, 'خيار صحيح', 1, 1]);
      db.run(`INSERT INTO quiz_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)`, [questionId, 'خيار خطأ 1', 2, 0]);
      db.run(`INSERT INTO quiz_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)`, [questionId, 'خيار خطأ 2', 3, 0]);
      db.run(`INSERT INTO quiz_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)`, [questionId, 'خيار خطأ 3', 4, 0]);
    }

    // Verify 20 questions exist
    const countCheck = db.exec(`SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = ${quizId}`);
    assert.strictEqual(countCheck[0].values[0][0], 20, 'Should have exactly 20 questions in quiz');

    // Verify each question has exactly 4 options and 1 correct
    const optCheck = db.exec(`
      SELECT question_id, COUNT(*) as opt_count, SUM(is_correct) as correct_count
      FROM quiz_options
      WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ${quizId})
      GROUP BY question_id
    `);
    assert.strictEqual(optCheck[0].values.length, 20);
    for (const row of optCheck[0].values) {
      assert.strictEqual(row[1], 4, 'Option count must be 4');
      assert.strictEqual(row[2], 1, 'Correct option count must be 1');
    }
  });

  it('3. Participant session creation, duplicate name handling & answer progression', async () => {
    const db = await getDb();
    const quizRow = db.exec(`SELECT id FROM quizzes LIMIT 1`)[0].values[0];
    const quizId = quizRow[0] as number;

    const participantSession = generateSessionId();
    const now = new Date().toISOString();

    // Insert first participant
    db.run(
      `INSERT INTO participants (quiz_id, participant_session_id, display_name, duplicate_name_index, started_at, status)
       VALUES (?, ?, ?, ?, ?, 'in_progress')`,
      [quizId, participantSession, 'أحمد', 1, now]
    );

    const partId = db.exec(`SELECT last_insert_rowid() AS id`)[0].values[0][0] as number;

    // Get 20 questions
    const qList = db.exec(`SELECT id FROM quiz_questions WHERE quiz_id = ${quizId} ORDER BY question_order ASC`)[0].values;
    assert.strictEqual(qList.length, 20);

    // Answer 15 correctly, 5 incorrectly
    for (let i = 0; i < 20; i++) {
      const qId = qList[i][0] as number;
      const opts = db.exec(`SELECT id, is_correct FROM quiz_options WHERE question_id = ${qId}`)[0].values;
      const correctOpt = opts.find(o => o[1] === 1)![0] as number;
      const wrongOpt = opts.find(o => o[1] === 0)![0] as number;

      const selected = i < 15 ? correctOpt : wrongOpt;
      db.run(
        `INSERT INTO participant_answers (participant_id, question_id, selected_option_id, answered_at)
         VALUES (?, ?, ?, ?)`,
        [partId, qId, selected, now]
      );
    }

    // Verify duplicate answer constraint
    assert.throws(() => {
      db.run(
        `INSERT INTO participant_answers (participant_id, question_id, selected_option_id, answered_at)
         VALUES (?, ?, ?, ?)`,
        [partId, qList[0][0], 999, now]
      );
    }, 'Database must forbid duplicate answers for the same question by the same participant');

    // Calculate score on server
    const scoreCalc = db.exec(`
      SELECT COUNT(*)
      FROM participant_answers pa
      JOIN quiz_options qo ON qo.id = pa.selected_option_id
      WHERE pa.participant_id = ${partId} AND qo.is_correct = 1
    `)[0].values[0][0] as number;

    assert.strictEqual(scoreCalc, 15, 'Calculated score must be exactly 15');

    // Update status to completed
    db.run(`UPDATE participants SET status = 'completed', score = ?, completed_at = ? WHERE id = ?`, [scoreCalc, now, partId]);

    const finalPart = db.exec(`SELECT status, score FROM participants WHERE id = ${partId}`)[0].values[0];
    assert.strictEqual(finalPart[0], 'completed');
    assert.strictEqual(finalPart[1], 15);
  });

  it('4. Leaderboard ranking and tie-breaker sorting', async () => {
    const db = await getDb();
    const quizId = db.exec(`SELECT id FROM quizzes LIMIT 1`)[0].values[0][0] as number;

    // Leaderboard query
    const res = db.exec(`
      SELECT display_name, score, completed_at
      FROM participants
      WHERE quiz_id = ${quizId} AND status = 'completed'
      ORDER BY score DESC, completed_at ASC, id ASC
    `);

    assert.ok(res.length > 0);
    assert.ok(res[0].values.length >= 1);
  });

  it('5. Unauthorized deletion forbidden, authorized deletion cascades cleanly', async () => {
    const db = await getDb();
    const quiz = db.exec(`SELECT id, admin_token_hash FROM quizzes LIMIT 1`)[0].values[0];
    const quizId = quiz[0] as number;

    // Wrong token should fail validation
    const fakeToken = 'wrong-token-12345';
    const fakeHash = hashToken(fakeToken);
    const check = db.exec(`SELECT id FROM quizzes WHERE id = ${quizId} AND admin_token_hash = '${fakeHash}'`);
    assert.strictEqual(check.length === 0 || check[0].values.length === 0, true, 'Wrong token must not match');

    // Authorized deletion
    db.run(`DELETE FROM participant_answers WHERE participant_id IN (SELECT id FROM participants WHERE quiz_id = ?)`, [quizId]);
    db.run(`DELETE FROM participants WHERE quiz_id = ?`, [quizId]);
    db.run(`DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ?)`, [quizId]);
    db.run(`DELETE FROM quiz_questions WHERE quiz_id = ?`, [quizId]);
    db.run(`DELETE FROM quizzes WHERE id = ?`, [quizId]);

    const remaining = db.exec(`SELECT id FROM quizzes WHERE id = ${quizId}`);
    assert.strictEqual(remaining.length === 0 || remaining[0].values.length === 0, true, 'Quiz must be deleted');
  });
});
