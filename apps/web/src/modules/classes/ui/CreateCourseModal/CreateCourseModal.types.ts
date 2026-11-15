import type { StudentDto } from '@viaquiz/shared-types';
export { createCourseSchema, type CreateCourseFormData } from '../../models/validators';

export interface CreateCourseModalProps {
  classUuid: string;
  isOpen: boolean;
  onClose: () => void;
  students: StudentDto[];
  currentClassCourses: number;
  maxClassCourses: number;
}

export interface CreateCourseFormProps {
  formId: string;
  students: StudentDto[];
  currentClassCourses: number;
  maxClassCourses: number;
  isCourseLimitReached: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmitForm: (data: import('../../models/validators').CreateCourseFormData) => Promise<void>;
}
