import { useGetStudentMeQuery } from '../../../modules/students';
import styles from '../Student.module.css';

export function StudentClassPage() {
  const { data: student, isLoading } = useGetStudentMeQuery();

  if (isLoading) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9090a8' }}>
          Завантаження інформації про клас...
        </div>
      </div>
    );
  }

  const classroom = student?.classroom;
  const teacher = classroom?.teacher;

  return (
    <div className={styles['student-dashboard-container']}>
      <div className={styles['welcome-banner']}>
        <div>
          <h2>Клас: {classroom?.name || 'Мій клас'}</h2>
          <p className={styles['welcome-meta']}>
            Вчитель: {teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : 'Вчитель'}
          </p>
        </div>
        {classroom?.code && (
          <div style={{ background: 'rgba(134, 59, 255, 0.2)', border: '1px solid #863bff', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, color: '#f0f0f5' }}>
            Код класу: {classroom.code}
          </div>
        )}
      </div>

      <div className={styles['section-block']}>
        <h3 className={styles['section-title']}>Курси мого класу</h3>
        <div className={styles['courses-grid']}>
          {(student?.courses || []).map((course: any) => (
            <div key={course.id} className={styles['course-item-card']}>
              <div>
                <h4 className={styles['course-item-name']}>{course.name}</h4>
                <p className={styles['course-item-meta']}>Зараховано</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
