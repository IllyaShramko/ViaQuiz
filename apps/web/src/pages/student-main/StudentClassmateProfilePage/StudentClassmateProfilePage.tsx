import { useParams } from 'react-router-dom';
import { useGetClassmateProfileQuery } from '../../../modules/students';
import { useStudentHeader, LockIcon } from '../../../shared';
import styles from './StudentClassmateProfilePage.module.css';

export function StudentClassmateProfilePage() {
  const { uuid } = useParams<{ uuid: string }>();

  useStudentHeader({
    title: 'Профіль',
    showBack: true,
    backTo: '/student/class',
    backLabel: 'Назад до списку класу',
  });

  const { data: profile, isLoading, error } = useGetClassmateProfileQuery(
    uuid || '',
    { skip: !uuid },
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles['loading-state']}>
          Завантаження профілю однокласника...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles['empty-state']}>
          Учня не знайдено або він не належить до вашого класу.
        </div>
      </div>
    );
  }

  const firstInitial = profile.firstName ? profile.firstName.charAt(0) : '';
  const lastInitial = profile.lastName ? profile.lastName.charAt(0) : '';
  const initials = `${firstInitial}${lastInitial}`.toUpperCase() || 'У';

  let formattedDate = '';
  try {
    const d = new Date(profile.createdAt);
    formattedDate = d.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    formattedDate = profile.createdAt;
  }

  return (
    <div className={styles.container}>
      <div className={styles['profile-card']}>
        {/* Header with avatar & name */}
        <div className={styles['header-row']}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.titles}>
            <h2 className={styles.name}>
              {profile.firstName} {profile.lastName}
            </h2>
            <p className={styles['role-badge']}>
              Учень класу {profile.classroomName}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles['info-grid']}>
          <div className={styles['info-item']}>
            <span className={styles['info-label']}>Клас</span>
            <span className={styles['info-value']}>
              {profile.classroomName || '—'}
            </span>
          </div>

          <div className={styles['info-item']}>
            <span className={styles['info-label']}>У класі з</span>
            <span className={styles['info-value']}>{formattedDate}</span>
          </div>

          <div className={styles['info-item']}>
            <span className={styles['info-label']}>Пройдено тестів</span>
            <span className={styles['info-value']}>
              {profile.stats?.totalQuizzesPassed ?? 0}
            </span>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className={styles['privacy-notice']}>
          <span className={styles['privacy-icon']}><LockIcon size={18} /></span>
          <span>
            Це публічний профіль однокласника. Логін та особисті дані приховані з метою безпеки.
          </span>
        </div>
      </div>
    </div>
  );
}
