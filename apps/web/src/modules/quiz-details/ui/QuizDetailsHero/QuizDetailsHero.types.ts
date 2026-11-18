import type { QuizDetail } from '../../models';

export interface QuizDetailsHeroProps {
  quiz: QuizDetail;
  isOwner?: boolean;
  onPreviewImage?: (image: { src: string; alt: string }) => void;
}
