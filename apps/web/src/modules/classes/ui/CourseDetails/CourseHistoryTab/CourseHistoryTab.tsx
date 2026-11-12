import { SessionsHistoryTable } from '../../../../reports';
import type { CourseHistoryTabProps } from './CourseHistoryTab.types';

export function CourseHistoryTab({ courseUuid }: CourseHistoryTabProps) {
  return (
    <SessionsHistoryTable
      courseUuid={courseUuid}
      searchPlaceholder="Пошук за назвою вікторини..."
    />
  );
}

