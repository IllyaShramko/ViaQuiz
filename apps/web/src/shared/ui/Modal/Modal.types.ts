import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'unstyled';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAfterClose?: () => void;
  size?: ModalSize;
  title?: ReactNode;
  subtitle?: ReactNode;
  ariaLabel?: string;
  footer?: ReactNode;
  showCloseButton?: boolean;
  isBusy?: boolean;
  closedBy?: 'any' | 'closerequest' | 'none';
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}
