import type {
  SortOrder,
  UserQuizSortBy,
  LikedQuizSortBy,
} from '@viaquiz/shared-types';
import type { QuizDetail, PublicQuizSummary } from '../../home/models';
export type { QuizDetail, PublicQuizSummary };

export type LibraryTab = 'my' | 'liked';

export type LibrarySortBy = UserQuizSortBy | LikedQuizSortBy;
export type LibrarySortOrder = SortOrder;

export interface LibraryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: LibrarySortBy;
  sortOrder?: LibrarySortOrder;
}

export interface MyQuizzesResponse {
  quizzes: QuizDetail[];
  total: number;
}

export interface LikedQuizzesResponse {
  quizzes: PublicQuizSummary[];
  total: number;
}
