export type QuestionType = 'ONE_ANSWER' | 'MANY_ANSWERS' | 'TYPE_ANSWER_V1' | 'TYPE_ANSWER_V2';
export type VariantType = 'TEXT' | 'IMAGE';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface EditorVariant {
  id?: number;
  uuid?: string;
  text: string | null;
  media?: string | null;
  type: VariantType;
  isCorrect: boolean;
  order: number;
}

export interface EditorQuestion {
  id: number;
  uuid: string;
  text: string;
  media: string | null;
  type: QuestionType;
  order: number;
  timeLimit: number;
  points: number;
  variants: EditorVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface EditorQuiz {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  coverImg: string | null;
  isDraft: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  questions: EditorQuestion[];
  keywords?: { id: number; name: string; quizId: number }[];
  _count?: { questions: number };
}

export interface CreateQuizPayload {
  name?: string;
  description?: string;
  isDraft?: boolean;
}

export interface UpdateQuizPayload {
  name?: string;
  description?: string | null;
  coverImg?: string | null;
  keywords?: string[];
  isDraft?: boolean;
}

export interface CreateQuestionPayload {
  type?: QuestionType;
  text?: string;
  order?: number;
  timeLimit?: number;
  points?: number;
  media?: string | null;
}

export interface UpdateQuestionPayload {
  type?: QuestionType;
  text?: string;
  order?: number;
  timeLimit?: number;
  points?: number;
  media?: string | null;
  variants?: Partial<EditorVariant>[];
}

export interface ReorderPayload {
  questionIds: number[];
}

export interface PublishValidationError {
  questionIndex: number;
  message: string;
}

export interface PublishErrorResponse {
  message: string;
  errors?: PublishValidationError[];
}
