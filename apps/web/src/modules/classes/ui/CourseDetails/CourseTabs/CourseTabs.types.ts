export type CourseTabType = 'students' | 'performance' | 'history';

export interface CourseTabsProps {
  activeTab: CourseTabType;
  onTabChange: (tab: CourseTabType) => void;
  studentsCount: number;
  onOpenEnrollModal: () => void;
  maxStudents?: number;
}
