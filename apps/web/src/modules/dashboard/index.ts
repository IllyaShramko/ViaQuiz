export {
  dashboardApi,
  useGetPublishedQuizzesQuery,
} from './api';

export type {
  QuizAuthor,
  Keyword,
  PublicQuizSummary,
  QuizzesResponse,
  QuizzesParams,
} from './models';

export {
  TeacherHeroSearch,
  TeacherQuizCard,
  TeacherQuizSkeleton,
  TeacherQuizzesHeader,
  TeacherQuizzesGrid,
  TeacherEmptyState,
  TeacherPagination,
  TEACHER_GRADIENTS,
  type TeacherHeroSearchProps,
  type TeacherQuizCardProps,
  type TeacherQuizSkeletonProps,
  type TeacherQuizzesHeaderProps,
  type TeacherQuizzesGridProps,
  type TeacherEmptyStateProps,
  type TeacherPaginationProps,
} from './ui';
