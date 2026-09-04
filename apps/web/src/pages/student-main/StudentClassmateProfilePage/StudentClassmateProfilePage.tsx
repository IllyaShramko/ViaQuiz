import { useParams, useNavigate } from 'react-router-dom';
import { useGetClassmateProfileQuery } from '../../../modules/students';
import styles from './StudentClassmateProfilePage.module.css';

export function StudentClassmateProfilePage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

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
        <button
          type="button"
          className={styles['back-button']}
          onClick={() => navigate('/student/class')}
        >
          ← До списку класу
        </button>
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
      <button
        type="button"
        className={styles['back-button']}
        onClick={() => navigate('/student/class')}
      >
        ← До списку класу
      </button>

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

        {/* Public Information Grid */}
        <div className={styles.grid}>
          <div className={styles['stat-item']}>
            <span className={styles['stat-label']}>Клас</span>
            <span className={styles['stat-value']}>{profile.classroomName}</span>
          </div>

          <div className={styles['stat-item']}>
            <span className={styles['stat-label']}>У класі з</span>
            <span className={styles['stat-value']}>{formattedDate}</span>
          </div>

          <div className={styles['stat-item']}>
            <span className={styles['stat-label']}>Пройдено тестів</span>
            <span className={styles['stat-value']}>
              {profile.stats.totalQuizzesPassed}
            </span>
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className={styles['privacy-notice']}>
          <span className={styles['privacy-icon']}>🔒</span>
          <span>
            Це публічний профіль однокласника. Логін та особисті дані приховані з метою безпеки.
          </span>
        </div>
      </div>
    </div>
  );
}
