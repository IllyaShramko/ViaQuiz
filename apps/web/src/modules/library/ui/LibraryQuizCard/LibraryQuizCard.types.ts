import type { MouseEvent } from 'react';
import type { QuizDetail, PublicQuizSummary } from '../../models';

export interface LibraryQuizCardProps {
  quiz: QuizDetail | PublicQuizSummary;
  isLikedTab?: boolean;
  index?: number;
  onClick: (uuid: string) => void;
  onEdit?: (uuid: string) => void;
  onDelete?: (e: MouseEvent, id: number) => void;
  onUnlike?: (e: MouseEvent, uuid: string) => void;
}
