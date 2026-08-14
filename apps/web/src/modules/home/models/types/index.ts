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
  keywords: Keyword[];
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