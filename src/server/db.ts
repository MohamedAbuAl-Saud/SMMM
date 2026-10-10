import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DEFAULT_QUESTIONS_POOL } from './defaultQuestions.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'bestie_check.sqlite');

let dbInstance: Database | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const buffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(buffer);
    } catch (err) {
      console.error('Failed to load existing SQLite file, creating new:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema & question bank
  initSchema(dbInstance);
  seedQuestionBank(dbInstance);
  saveDbImmediately();

  return dbInstance;
}

export function saveDbImmediately(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch (err) {
    console.error('Error saving SQLite DB to disk:', err);
  }
}

export function scheduleSaveDb(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDbImmediately();
  }, 100);
}

function initSchema(db: Database): void {
  db.run(`
    PRAGMA foreign_keys = ON;

    DROP TABLE IF EXISTS quizzes;
    CREATE TABLE quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_code TEXT UNIQUE NOT NULL,
      admin_token_hash TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      optional_country TEXT,
      optional_gender TEXT,
      total_questions INTEGER DEFAULT 20,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_order INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      option_order INTEGER NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      participant_session_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      duplicate_name_index INTEGER DEFAULT 1,
      score INTEGER DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      status TEXT DEFAULT 'in_progress'
    );

    CREATE TABLE IF NOT EXISTS participant_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      selected_option_id INTEGER NOT NULL REFERENCES quiz_options(id) ON DELETE CASCADE,
      answered_at TEXT NOT NULL,
      UNIQUE(participant_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS quiz_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER,
      event_type TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bank_questions (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bank_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL REFERENCES bank_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      option_order INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_quizzes_public_code ON quizzes(public_code);
    CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON quiz_questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_options_question_id ON quiz_options(question_id);
    CREATE INDEX IF NOT EXISTS idx_participants_quiz_id ON participants(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_participant_answers_participant_id ON participant_answers(participant_id);
    CREATE INDEX IF NOT EXISTS idx_bank_options_question_id ON bank_options(question_id);
  `);
}

export function seedQuestionBank(db: Database): void {
  try {
    const res = db.exec("SELECT COUNT(*) FROM bank_questions");
    const count = (res.length > 0 && res[0].values.length > 0) ? Number(res[0].values[0][0]) : 0;
    const musicCheck = db.exec("SELECT question_text FROM bank_questions WHERE id = 'music_1'");
    const musicText = (musicCheck.length > 0 && musicCheck[0].values.length > 0) ? String(musicCheck[0].values[0][0]) : '';
    if (count < 80 || !musicText.includes('القرآن')) {
      db.run("DELETE FROM bank_options;");
      db.run("DELETE FROM bank_questions;");
      const insertQ = db.prepare("INSERT INTO bank_questions (id, category, question_text, question_order) VALUES (?, ?, ?, ?)");
      const insertOpt = db.prepare("INSERT INTO bank_options (question_id, option_text, option_order) VALUES (?, ?, ?)");
      
      DEFAULT_QUESTIONS_POOL.forEach((q, qIndex) => {
        insertQ.run([q.id, q.category, q.text, qIndex + 1]);
        q.defaultOptions.forEach((opt, optIndex) => {
          insertOpt.run([q.id, opt, optIndex + 1]);
        });
      });
      
      insertQ.free();
      insertOpt.free();
    }
  } catch (err) {
    console.error("Error seeding question bank in SQLite DB:", err);
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function generateSessionId(): string {
  return crypto.randomBytes(24).toString('hex');
}
