import type { FieldErrors, UseFormGetValues, UseFormRegister } from 'react-hook-form';
import type { RegisterFormInputs } from '../../../../models';

export interface StepCredentialsProps {
  register: UseFormRegister<RegisterFormInputs>;
  errors: FieldErrors<RegisterFormInputs>;
  getValues: UseFormGetValues<RegisterFormInputs>;
  onNext: () => void;
  isLoading: boolean;
  isVisible: boolean;
}
