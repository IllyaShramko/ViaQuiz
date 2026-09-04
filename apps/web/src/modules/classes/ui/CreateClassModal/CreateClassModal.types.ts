export { createClassSchema, type CreateClassFormData } from '../../models/validators';

export interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentActiveClasses: number;
  maxClasses: number;
}
