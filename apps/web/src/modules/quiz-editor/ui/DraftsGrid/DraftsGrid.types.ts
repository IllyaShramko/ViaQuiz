import type { EditorQuiz } from '../../models';
import type { DraftSortField } from '../DraftsToolbar/DraftsToolbar.types';

export interface DraftsGridProps {
  drafts: EditorQuiz[];
  isLoading?: boolean;
  isError?: boolean;
  isCreating?: boolean;
  canCreateMore: boolean;
  deletingId?: number | null;
  isDeleting?: boolean;
  publishingId?: number | null;
  sortBy?: DraftSortField;
  maxDrafts?: number;
  onRetry?: () => void;
  onCreateNew: () => void;
  onOpenDraft: (uuid: string) => void;
  onDeleteDraft: (draft: EditorQuiz) => void;
  onPublishDraft?: (draft: EditorQuiz) => void;
}
