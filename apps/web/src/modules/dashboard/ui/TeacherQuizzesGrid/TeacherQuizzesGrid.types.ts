import type { PublicQuizSummary } from '../../models';

export interface TeacherQuizzesGridProps {
  quizzes: PublicQuizSummary[];
  isLoading: boolean;
  isError: boolean;
  skeletonCount?: number;
  onCardClick: (uuid: string) => void;
  onRetry?: () => void;
}
