import { useGetStudentMeQuery } from '../../../modules/students/api/studentsApi';
import styles from '../Student.module.css';

export function StudentProfilePage() {
  const { data: student, isLoading } = useGetStudentMeQuery();

  if (isLoading) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9090a8' }}>
          Завантаження профілю...
        </div>
      </div>
    );
  }

  return (
    <div className={styles['student-dashboard-container']}>
      <div className={styles['welcome-banner']}>
        <div>
          <h2>
            {student?.firstName} {student?.lastName}
          </h2>
          <p className={styles['welcome-meta']}>
            Логін: <strong style={{ color: '#863bff' }}>{student?.login}</strong> • Клас:{' '}
            <strong style={{ color: '#f0f0f5' }}>{student?.classroom?.name}</strong>
          </p>
        </div>
      </div>

      <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ margin: 0, color: '#f0f0f5', fontSize: '1.15rem' }}>Дані облікового запису</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9090a8' }}>Ім'я:</span>
            <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '1rem', marginTop: '2px' }}>{student?.firstName}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9090a8' }}>Прізвище:</span>
            <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '1rem', marginTop: '2px' }}>{student?.lastName}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9090a8' }}>Логін:</span>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#863bff', fontSize: '1rem', marginTop: '2px' }}>{student?.login}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9090a8' }}>Клас:</span>
            <div style={{ fontWeight: 700, color: '#f0f0f5', fontSize: '1rem', marginTop: '2px' }}>{student?.classroom?.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
