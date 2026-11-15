import type { EditorQuiz } from '../../models';

export interface DeleteDraftModalProps {
  draft: EditorQuiz | null;
  isOpen?: boolean;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onAfterClose?: () => void;
  onConfirm: (draft: EditorQuiz) => void;
}
