export { addStudentSchema, type AddStudentFormData } from '../../models/validators';

export interface AddStudentModalProps {
  classUuid: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface CreatedStudentCredentials {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AddStudentFormProps {
  formId: string;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmitForm: (data: import('../../models/validators').AddStudentFormData) => Promise<void>;
}

export interface AddStudentSuccessProps {
  credentials: CreatedStudentCredentials;
  copied: boolean;
  onCopy: () => Promise<void>;
}
