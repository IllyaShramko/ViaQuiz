import type { PublicQuizSummary } from '../../../models';

export interface QuizzesSectionProps {
  onSelectQuiz?: (quiz: PublicQuizSummary) => void;
}
