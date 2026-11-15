export interface QuizCoverFieldProps {
  coverImg: string | null;
  isUploading: boolean;
  uploadError: string | null;
  onUploadFile: (file: File) => void;
  onRemoveCover: () => void;
}
