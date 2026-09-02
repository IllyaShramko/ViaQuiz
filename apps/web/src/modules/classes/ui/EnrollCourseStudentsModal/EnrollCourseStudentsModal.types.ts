import type { StudentDto } from '@viaquiz/shared-types';

export interface EnrollCourseStudentsModalProps {
  classUuid: string;
  courseUuid: string;
  isOpen: boolean;
  onClose: () => void;
  classroomStudents: StudentDto[];
  alreadyEnrolledUuids: string[];
  maxCourseStudents?: number;
}
