export { createClassSchema, type CreateClassFormData } from '../../models/validators';

export interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentActiveClasses: number;
  maxClasses: number;
}

export interface CreateClassFormProps {
  formId: string;
  currentActiveClasses: number;
  maxClasses: number;
  isLimitReached: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmitForm: (data: import('../../models/validators').CreateClassFormData) => Promise<void>;
}
