import type { EditorQuiz } from '../../models';
import type { DraftSortField } from '../DraftsToolbar/DraftsToolbar.types';

export interface DraftCardProps {
  draft: EditorQuiz;
  index?: number;
  isDeleting?: boolean;
  isPublishing?: boolean;
  sortBy?: DraftSortField;
  onOpen: (uuid: string) => void;
  onDelete: (draft: EditorQuiz) => void;
  onPublish?: (draft: EditorQuiz) => void;
}
