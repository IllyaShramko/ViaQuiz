import type { StudentDto } from '@viaquiz/shared-types';

export interface CreateCourseModalProps {
  classUuid: string;
  isOpen: boolean;
  onClose: () => void;
  students: StudentDto[];
  currentClassCourses: number;
  maxClassCourses: number;
}
