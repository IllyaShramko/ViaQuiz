export interface VerificationCodeModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  targetEmail: string;
  confirmLabel: string;
  cooldown: number;
  isSubmitting: boolean;
  isResending: boolean;
  error: string | null;
  onClearError: () => void;
  onConfirm: (code: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
  onClose: () => void;
  onAfterClose?: () => void;
}
