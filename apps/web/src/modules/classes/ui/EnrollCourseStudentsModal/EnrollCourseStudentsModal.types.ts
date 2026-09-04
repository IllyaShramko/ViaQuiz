import type { StudentDto } from '@viaquiz/shared-types';
export {
  enrollCourseStudentsSchema,
  type EnrollCourseStudentsFormData,
} from '../../models/validators';

export interface EnrollCourseStudentsModalProps {
  classUuid: string;
  courseUuid: string;
  isOpen: boolean;
  onClose: () => void;
  classroomStudents: StudentDto[];
  alreadyEnrolledUuids: string[];
  maxCourseStudents?: number;
}
