import type { EditorQuiz } from '../../models';

export interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: EditorQuiz;
  onPublishSuccess: () => void;
  onAfterClose?: () => void;
}

export interface PublishModalFormProps {
  formId: string;
  quiz: EditorQuiz;
  isUploading: boolean;
  onSubmitForm: (payload: {
    name: string;
    description: string | null;
    coverImg: string | null;
    keywords: string[];
  }) => Promise<string[]>;
  onUploadCoverFile: (file: File) => Promise<{ url?: string; error?: string }>;
}
