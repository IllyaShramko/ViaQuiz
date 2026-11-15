export { inviteTeacherSchema, type InviteTeacherFormData } from '../../models/validators';

export interface InviteTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classUuid: string;
  courseUuid: string;
  courseName: string;
}

export interface InviteTeacherFormProps {
  formId: string;
  courseName: string;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmitForm: (data: import('../../models/validators').InviteTeacherFormData) => Promise<void>;
}
