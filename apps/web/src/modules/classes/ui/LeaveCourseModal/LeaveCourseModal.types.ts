export interface LeaveCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  classUuid: string;
  courseUuid: string;
  courseName: string;
  onSuccess?: () => void;
}
