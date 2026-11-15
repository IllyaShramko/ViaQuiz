import { StarIcon, UsersIcon } from '../../../../shared';
import { ProfileStatCard } from '../ProfileStatCard';
import type { ProfileStatsGridProps } from './ProfileStatsGrid.types';
import styles from './ProfileStatsGrid.module.css';

export function ProfileStatsGrid({
  totalQuizzes,
  activeClassesCount,
  gamesCount = 0,
  quizzesHref,
  classesHref,
  gamesHref,
  isLoadingQuizzes = false,
  isLoadingClasses = false,
  isLoadingGames = false,
  isLoading = false,
}: ProfileStatsGridProps) {
  const showClasses = activeClassesCount !== undefined;
  const loadingQuizzes = isLoading || isLoadingQuizzes;
  const loadingClasses = isLoading || isLoadingClasses;
  const loadingGames = isLoading || isLoadingGames;

  return (
    <div className={`${styles.strip} ${!showClasses ? styles.stripTwoCols : ''}`}>
      <ProfileStatCard
        icon={<StarIcon size={14} />}
        value={totalQuizzes}
        label="Створених вікторин"
        to={quizzesHref}
        isLoading={loadingQuizzes}
      />

      {showClasses && (
        <ProfileStatCard
          icon={<UsersIcon size={14} />}
          value={activeClassesCount}
          label="Активних класів"
          to={classesHref}
          isLoading={loadingClasses}
        />
      )}

      <ProfileStatCard
        icon={
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        }
        value={gamesCount}
        label="Проведених ігор"
        to={gamesHref}
        isLoading={loadingGames}
      />
    </div>
  );
}
