import type { User } from '../../../../modules/auth/models';
import styles from '../Profile.module.css';

export interface ProfileAccountInfoProps {
  user: User | null;
  title?: string;
  defaultEmail?: string;
  defaultUsername?: string;
}

export function ProfileAccountInfo({
  user,
  title = 'Інформація про акаунт',
  defaultEmail = 'shramko@example.com',
  defaultUsername = 'username',
}: ProfileAccountInfoProps) {
  const username = user?.login || defaultUsername;
  const email = user?.email || defaultEmail;

  return (
    <div className={styles['profile-section-card']}>
      <h3 className={styles['profile-section-title']}>{title}</h3>

      <div className={styles['profile-details-list']}>
        <div className={styles['profile-detail-row']}>
          <span className={styles['profile-detail-label']}>Email</span>
          <span className={styles['profile-detail-value']}>{email}</span>
        </div>
        <div className={styles['profile-detail-row']}>
          <span className={styles['profile-detail-label']}>Логін</span>
          <span className={styles['profile-detail-value']}>{username}</span>
        </div>
        <div className={styles['profile-detail-row']}>
          <span className={styles['profile-detail-label']}>Статус</span>
          <span className={`${styles['profile-detail-value']} ${styles['status-active']}`}>Активний</span>
        </div>
      </div>
    </div>
  );
}
