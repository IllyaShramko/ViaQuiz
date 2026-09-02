import type { UseFormRegisterReturn } from 'react-hook-form';

export interface PasswordInputProps {
  id: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  disabled?: boolean;
}
