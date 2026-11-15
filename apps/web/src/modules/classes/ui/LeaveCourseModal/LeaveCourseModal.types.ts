export interface LeaveCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAfterClose?: () => void;
  classUuid: string;
  courseUuid: string;
  courseName: string;
  onSuccess?: () => void;
}
