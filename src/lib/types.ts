export interface Option {
  id?: number;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionDraft {
  order: number;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface PlayQuestion {
  id: number;
  order: number;
  total: number;
  text: string;
  options: {
    id: number;
    text: string;
  }[];
}

export interface QuestionBreakdown {
  questionOrder: number;
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface QuizResult {
  participantName: string;
  creatorName: string;
  score: number;
  total: number;
  percentage: number;
  rank: number;
  breakdown: QuestionBreakdown[];
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  displayName: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

export interface StoredQuizItem {
  quizId: number;
  publicCode: string;
  adminToken: string;
  creatorName: string;
  createdAt: string;
  totalParticipants?: number;
  completedParticipants?: number;
}
