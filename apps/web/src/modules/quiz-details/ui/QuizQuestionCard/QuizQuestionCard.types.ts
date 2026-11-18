import type { QuizQuestion } from '../../models';

export interface QuizQuestionCardProps {
  question: QuizQuestion;
  index: number;
  showCorrectAnswers?: boolean;
  onPreviewImage?: (image: { src: string; alt: string }) => void;
}
