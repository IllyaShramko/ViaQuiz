import { useUserContext } from '../../../modules/auth/context';
import {
  useGetMyQuizzesQuery,
  ProfileHeaderCard,
  ProfileStatsGrid,
  ProfileAccountInfo,
} from '../../../modules/profile';
import styles from '../../../modules/profile/ui/Profile.module.css';

export function ProfilePage() {
  const { user } = useUserContext();
  const { data: myQuizzesData, isLoading: isLoadingQuizzes } = useGetMyQuizzesQuery({ isDraft: false });

  const totalQuizzes = myQuizzesData?.total ?? myQuizzesData?.quizzes?.length ?? 0;

  return (
    <div className={styles['teacher-profile-page']}>
      <ProfileHeaderCard user={user} />
      <ProfileStatsGrid totalQuizzes={totalQuizzes} isLoadingQuizzes={isLoadingQuizzes} />
      <ProfileAccountInfo user={user} />
    </div>
  );
}
