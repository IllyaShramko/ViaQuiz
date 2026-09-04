export { inviteTeacherSchema, type InviteTeacherFormData } from '../../models/validators';

export interface InviteTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classUuid: string;
  courseUuid: string;
  courseName: string;
}
