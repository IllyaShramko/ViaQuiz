export type ClassTabType = 'students' | 'courses' | 'performance' | 'history';

export interface ClassTabsProps {
  activeTab: ClassTabType;
  onTabChange: (tab: ClassTabType) => void;
  studentsCount: number;
  coursesCount: number;
  maxStudents?: number;
  maxCourses?: number;
  onOpenAddStudent: () => void;
  onOpenCreateCourse: () => void;
}
