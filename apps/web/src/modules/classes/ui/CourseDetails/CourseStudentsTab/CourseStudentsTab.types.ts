import type { StudentDto } from '@viaquiz/shared-types';

export interface CourseStudentsTabProps {
  classUuid: string;
  courseUuid: string;
  className?: string;
  students: StudentDto[];
  onOpenEnrollModal: () => void;
}
