export type AuthRole = 'teacher' | 'student';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  defaultRole?: AuthRole;
}
