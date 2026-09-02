import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { RegisterFormInputs } from '../../../../models';

export interface StepVerificationProps {
  register: UseFormRegister<RegisterFormInputs>;
  errors: FieldErrors<RegisterFormInputs>;
  targetEmail: string;
  cooldown: number;
  onResend: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isVisible: boolean;
}
