import { useUserContext } from '../../../modules/auth/context';
import {
  useGetProfileStatsQuery,
  ProfileHeaderCard,
  ProfileStatsGrid,
  ProfileAccountInfo,
} from '../../../modules/profile';
import styles from '../../../modules/profile/ui/Profile.module.css';

export function ProfilePage() {
  const { user } = useUserContext();
  const { data: stats, isLoading: isLoadingStats } = useGetProfileStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <div className={styles['teacher-profile-page']}>
      <ProfileHeaderCard user={user} />
      <ProfileStatsGrid
        totalQuizzes={stats?.totalQuizzes ?? 0}
        activeClassesCount={stats?.activeClassesCount ?? 0}
        gamesCount={stats?.gamesCount ?? 0}
        isLoading={isLoadingStats}
      />
      <ProfileAccountInfo user={user} />
    </div>
  );
}
