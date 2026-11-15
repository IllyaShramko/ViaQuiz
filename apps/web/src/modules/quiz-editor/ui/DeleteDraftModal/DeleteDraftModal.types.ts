import type { EditorQuiz } from '../../models';

export interface DeleteDraftModalProps {
  draft: EditorQuiz | null;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (draft: EditorQuiz) => void;
}
