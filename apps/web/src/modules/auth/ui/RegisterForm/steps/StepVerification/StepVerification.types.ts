import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type { RegisterFormInputs } from '../../../../models';

export interface StepVerificationProps {
  register: UseFormRegister<RegisterFormInputs>;
  setValue: UseFormSetValue<RegisterFormInputs>;
  watch: UseFormWatch<RegisterFormInputs>;
  errors: FieldErrors<RegisterFormInputs>;
  targetEmail: string;
  cooldown: number;
  onResend: () => void;
  onBack: () => void;
  onSubmitForm?: () => void;
  verificationError?: string | null;
  onClearError?: () => void;
  isSubmitting: boolean;
  isVisible: boolean;
}
