import { Link } from 'react-router-dom';
import { useUserContext } from '../../../modules/auth/context';
import {
  ProfileAccountInfo,
  ProfileHeaderCard,
  ProfileQuizzesSection,
  ProfileStatsGrid,
  useGetMyQuizzesQuery,
  useGetProfileStatsQuery,
} from '../../../modules/profile';
import { PublicIcon, SettingsIcon, useTeacherHeader } from '../../../shared';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  useTeacherHeader({
    title: 'Профіль',
    showBack: true,
    backTo: '/dashboard',
    backLabel: 'Назад до головної',
  });

  const { user } = useUserContext();
  const { data: stats, isLoading: isLoadingStats } = useGetProfileStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    isError: isQuizzesError,
  } = useGetMyQuizzesQuery(
    { isDraft: false, page: 1, limit: 6 },
    { refetchOnMountOrArgChange: true },
  );

  const roleLabel = user?.role === 'ADMIN' ? 'Адміністратор' : 'Викладач';

  return (
    <div className={styles.container}>
      <ProfileHeaderCard
        user={user}
        roleLabel={roleLabel}
        actions={
          <div className={styles.headerActions}>
            {user?.uuid && (
              <Link to={`/users/${user.uuid}`} className={styles.secondaryBtn}>
                <PublicIcon size={13} aria-hidden="true" />
                <span>Публічний профіль</span>
              </Link>
            )}
            <Link to="/settings" className={styles.secondaryBtn}>
              <SettingsIcon size={15} aria-hidden="true" />
              <span>Налаштування</span>
            </Link>
          </div>
        }
      />

      <ProfileStatsGrid
        totalQuizzes={stats?.totalQuizzes ?? 0}
        activeClassesCount={stats?.activeClassesCount ?? 0}
        gamesCount={stats?.gamesCount ?? 0}
        quizzesHref="/library"
        classesHref="/classes"
        gamesHref="/dashboard/reports"
        isLoading={isLoadingStats}
      />

      <div className={styles.layoutGrid}>
        <ProfileAccountInfo user={user} />

        <ProfileQuizzesSection
          quizzes={quizzesData?.quizzes ?? []}
          total={quizzesData?.total ?? stats?.totalQuizzes}
          isLoading={isLoadingQuizzes}
          isError={isQuizzesError}
        />
      </div>
    </div>
  );
}
