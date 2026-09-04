export type AuthRole = 'teacher' | 'student';

export {
  teacherLoginSchema,
  studentLoginSchema,
  type TeacherLoginFormData,
  type StudentLoginFormData,
} from '../../models/validators';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  defaultRole?: AuthRole;
}
