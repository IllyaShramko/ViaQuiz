import { useGetStudentCoursesQuery } from '../../../modules/students/api/studentsApi';
import styles from '../Student.module.css';

export function StudentCoursesPage() {
  const { data: courses, isLoading } = useGetStudentCoursesQuery();

  if (isLoading) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9090a8' }}>
          Завантаження курсів...
        </div>
      </div>
    );
  }

  const courseList = courses || [];

  return (
    <div className={styles['student-dashboard-container']}>
      <div className={styles['section-block']}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f0f5', margin: '0 0 8px 0' }}>
          Мої курси ({courseList.length})
        </h2>

        {courseList.length === 0 ? (
          <div style={{ background: '#1a1a26', border: '1px dashed #2a2a3a', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#9090a8' }}>
            Наразі ви не записані до окремих курсів
          </div>
        ) : (
          <div className={styles['courses-grid']}>
            {courseList.map((course: any) => (
              <div key={course.uuid} className={styles['course-item-card']}>
                <div>
                  <h4 className={styles['course-item-name']}>{course.name}</h4>
                  <p className={styles['course-item-meta']}>
                    Клас: {course.classroom?.name || 'Мій клас'} • {course._count?.rooms || 0} сесій
                  </p>
                </div>
                <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>
                  Зараховано
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
