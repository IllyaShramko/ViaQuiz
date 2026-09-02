export interface TeacherPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}
