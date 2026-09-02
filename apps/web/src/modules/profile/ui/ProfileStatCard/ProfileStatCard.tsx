import type { ProfileStatCardProps } from './ProfileStatCard.types';
import styles from '../Profile.module.css';

export function ProfileStatCard({ icon, value, label }: ProfileStatCardProps) {
  return (
    <div className={styles['profile-stat-card']}>
      <div className={styles['profile-stat-card__icon']}>{icon}</div>
      <div className={styles['profile-stat-card__content']}>
        <span className={styles['profile-stat-number']}>{value}</span>
        <span className={styles['profile-stat-label']}>{label}</span>
      </div>
    </div>
  );
}
