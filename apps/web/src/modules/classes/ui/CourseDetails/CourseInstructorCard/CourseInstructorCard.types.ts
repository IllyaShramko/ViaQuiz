import type { CourseDto } from '@viaquiz/shared-types';

export interface CourseInstructorCardProps {
  course: CourseDto;
  classUuid: string;
  isCreator: boolean;
  onOpenInviteModal: () => void;
}
