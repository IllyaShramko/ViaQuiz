import type { UseFormRegister } from 'react-hook-form';
import type { RegisterFormInputs } from '../../../../models';

export interface StepProfileProps {
  register: UseFormRegister<RegisterFormInputs>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
  isVisible: boolean;
}
