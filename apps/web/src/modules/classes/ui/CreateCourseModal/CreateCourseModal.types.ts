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
