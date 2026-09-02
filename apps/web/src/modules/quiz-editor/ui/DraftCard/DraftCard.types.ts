import type React from 'react';
import type { EditorQuiz } from '../../models';
import type { DraftSortField } from '../DraftsToolbar/DraftsToolbar.types';

export interface DraftCardProps {
  draft: EditorQuiz;
  index?: number;
  isDeleting?: boolean;
  sortBy?: DraftSortField;
  onOpen: (uuid: string) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}
