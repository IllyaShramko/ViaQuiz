import type { EditorQuiz } from '../../models';

export interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: EditorQuiz;
  onPublishSuccess: () => void;
}
