export {
  profileApi,
  useGetMyQuizzesQuery,
  useGetProfileStatsQuery,
  useGetPublicProfileQuery,
} from './api';

export type {
  QuizzesResponse,
  QuizAuthor,
  PublicQuizSummary,
  TeacherProfileStatsDto,
  PublicUserProfileDto,
} from './models';

export { useCopyState } from './models';

export {
  ProfileHeaderCard,
  ProfileStatCard,
  ProfileStatsGrid,
  ProfileAccountInfo,
  ProfileQuizzesSection,
  type ProfileHeaderCardProps,
  type ProfileHeaderCardUser,
  type ProfileStatCardProps,
  type ProfileStatsGridProps,
  type ProfileAccountInfoProps,
  type ProfileQuizzesSectionProps,
} from './ui';
