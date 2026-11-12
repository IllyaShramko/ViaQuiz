import type { StudentDto } from '@viaquiz/shared-types';

export interface ClassStudentsTabProps {
  classUuid: string;
  students: StudentDto[];
  maxStudents?: number;
  onOpenAddStudent: () => void;
  onResetPassword: (target: { uuid: string; name: string }) => void;
  onDeleteStudent: (studentUuid: string, studentName: string) => void;
}
