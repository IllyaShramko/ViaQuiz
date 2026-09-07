export {
  profileApi,
  useGetMyQuizzesQuery,
  useGetProfileStatsQuery,
} from './api';

export type {
  QuizzesResponse,
  QuizAuthor,
  PublicQuizSummary,
  TeacherProfileStatsDto,
} from './models';

export {
  ProfileHeaderCard,
  ProfileStatCard,
  ProfileStatsGrid,
  ProfileAccountInfo,
  type ProfileHeaderCardProps,
  type ProfileStatCardProps,
  type ProfileStatsGridProps,
  type ProfileAccountInfoProps,
} from './ui';
