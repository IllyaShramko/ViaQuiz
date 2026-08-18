export interface QuizAuthor {
  id: number;
  uuid: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Keyword {
  id: number;
  name: string;
  quizId: number;
}

export interface QuestionVariant {
  id: number;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface QuizQuestion {
  id: number;
  text: string;
  title?: string;
  type: string;
  timeLimit: number;
  points: number;
  order: number;
  media?: string | null;
  img?: string | null;
  variants?: QuestionVariant[];
}

export interface PublicQuizSummary {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  coverImg: string | null;
  isDraft: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: QuizAuthor;
  keywords?: Keyword[];
  _count?: {
    questions: number;
  };
}

export interface QuizDetail {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  coverImg: string | null;
  isDraft: boolean;
  authorId: number;
  author?: QuizAuthor;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
  _count?: {
    questions: number;
  };
}

export interface QuizzesResponse {
  quizzes: PublicQuizSummary[];
  total: number;
}

export interface QuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}