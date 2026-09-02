import type { PublicQuizSummary } from '../../../models';

export interface QuizCardProps {
  quiz: PublicQuizSummary;
  index?: number;
  onClick?: (quiz: PublicQuizSummary) => void;
}
