import type { ProfileStatsGridProps } from './ProfileStatsGrid.types';
import { ProfileStatCard } from '../ProfileStatCard';
import styles from '../Profile.module.css';

export function ProfileStatsGrid({
  totalQuizzes,
  activeClassesCount = 0,
  gamesCount = 0,
  isLoadingQuizzes = false,
  isLoadingClasses = false,
  isLoadingGames = false,
  isLoading = false,
}: ProfileStatsGridProps) {
  const loadingQuizzes = isLoading || isLoadingQuizzes;
  const loadingClasses = isLoading || isLoadingClasses;
  const loadingGames = isLoading || isLoadingGames;

  return (
    <div className={styles['profile-stats-grid']}>
      <ProfileStatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        }
        value={loadingQuizzes ? '...' : totalQuizzes}
        label="Створених вікторин"
      />

      <ProfileStatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        value={loadingClasses ? '...' : activeClassesCount}
        label="Активних класів"
      />

      <ProfileStatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        }
        value={loadingGames ? '...' : gamesCount}
        label="Проведених ігор"
      />
    </div>
  );
}
