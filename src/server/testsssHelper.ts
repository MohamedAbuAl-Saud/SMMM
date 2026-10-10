import fs from 'fs';
import path from 'path';

export const TESTSSS_DIR = path.resolve(process.cwd(), 'testsss');

/**
 * Ensures testsss directory exists.
 */
export function ensureTestsssDir(): void {
  try {
    if (!fs.existsSync(TESTSSS_DIR)) {
      fs.mkdirSync(TESTSSS_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create testsss directory:', err);
  }
}

/**
 * Counts existing files in testsss for a specific creator to determine quiz number
 */
function getQuizNumberForCreator(cleanName: string): number {
  try {
    ensureTestsssDir();
    const files = fs.readdirSync(TESTSSS_DIR);
    let count = 0;
    for (const f of files) {
      if (f.startsWith(cleanName)) {
        count++;
      }
    }
    return count + 1;
  } catch (err) {
    console.error('Error counting files for creator:', err);
    return 1;
  }
}

/**
 * Generates random code alphanumeric sequence
 */
function generateRandomSuffix(len = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (const _ of Array.from({ length: len })) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

export interface QuizQuestionData {
  questionText: string;
  correctAnswerText: string;
}

/**
 * Saves a .txt file in testsss folder with the creator's name, random code, and optional quiz count number
 * Example: محمدdhdj8282+.txt or محمد2dhdj8282+.txt
 * Content:
 * السؤال: ...
 * الاجابه الصح: ...
 */
export function saveQuizTxtFile(
  creatorName: string,
  questions: QuizQuestionData[]
): { fileName: string; filePath: string } {
  ensureTestsssDir();

  // Sanitize creator name (keep Arabic characters and alphanumerics, remove all special chars and emojis)
  const safeName = creatorName.trim().replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]/g, '') || 'اختبار';
  const quizNum = getQuizNumberForCreator(safeName);
  const quizNumStr = quizNum > 1 ? `${quizNum}` : '';
  const randomSuffix = generateRandomSuffix(8);

  // E.g. محمدdhdj8282+.txt or محمد2dhdj8282+.txt
  const fileName = `${safeName}${quizNumStr}${randomSuffix}+.txt`;
  const filePath = path.join(TESTSSS_DIR, fileName);

  let fileContent = `=====================================\n`;
  fileContent += `اختبار: ${creatorName}\n`;
  fileContent += `التاريخ: ${new Date().toLocaleString('ar-EG')}\n`;
  fileContent += `=====================================\n\n`;

  questions.forEach((q, idx) => {
    fileContent += `السؤال ${idx + 1}:\n${q.questionText}\n`;
    fileContent += `الاجابه الصح:\n${q.correctAnswerText}\n\n`;
  });

  fs.writeFileSync(filePath, fileContent, 'utf-8');

  return { fileName, filePath };
}
