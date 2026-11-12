import type { CourseDto } from '@viaquiz/shared-types';

export interface ClassCoursesTabProps {
  classUuid: string;
  courses: CourseDto[];
  maxStudentsPerCourse?: number;
  onOpenCreateCourse: () => void;
}
