export { addStudentSchema, type AddStudentFormData } from '../../models/validators';

export interface AddStudentModalProps {
  classUuid: string;
  isOpen: boolean;
  onClose: () => void;
}
