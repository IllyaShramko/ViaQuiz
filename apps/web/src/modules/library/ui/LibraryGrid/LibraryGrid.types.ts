import type { MouseEvent } from 'react';
import type { QuizDetail, PublicQuizSummary } from '../../models';

export interface LibraryGridProps {
  quizzes: (QuizDetail | PublicQuizSummary)[];
  isLoading: boolean;
  isError: boolean;
  isLikedTab?: boolean;
  hasSearch?: boolean;
  onCardClick: (uuid: string) => void;
  onEdit?: (uuid: string) => void;
  onDelete?: (e: MouseEvent, id: number) => void;
  onUnlike?: (e: MouseEvent, uuid: string) => void;
  onCreateQuiz?: () => void;
  onExplore?: () => void;
  onRetry?: () => void;
}
