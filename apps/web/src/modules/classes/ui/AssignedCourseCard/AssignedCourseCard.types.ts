import type { AssignedCourseSummaryDto } from '@viaquiz/shared-types';

export interface AssignedCourseCardProps {
  course: AssignedCourseSummaryDto;
  onLeaveCourse: (classUuid: string, courseUuid: string, courseName: string) => void;
}
