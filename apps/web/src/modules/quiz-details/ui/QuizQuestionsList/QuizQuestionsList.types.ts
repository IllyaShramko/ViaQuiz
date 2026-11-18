import type { QuizQuestion } from '../../models';

export interface QuizQuestionsListProps {
  questions: QuizQuestion[];
  title?: string;
  emptyMessage?: string;
  onPreviewImage?: (image: { src: string; alt: string }) => void;
}
