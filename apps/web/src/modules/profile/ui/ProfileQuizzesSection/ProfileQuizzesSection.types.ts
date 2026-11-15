import type { PublicQuizSummary } from '../../models';

export interface ProfileQuizzesSectionProps {
  quizzes: PublicQuizSummary[];
  total?: number;
  isLoading?: boolean;
  isError?: boolean;
}
