import { Link, useNavigate } from 'react-router-dom';
import { useGetStudentDashboardQuery } from '../../../modules/students/api/studentsApi';
import styles from '../Student.module.css';
import classesStyles from '../../../modules/classes/ui/Classes.module.css';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetStudentDashboardQuery();

  if (isLoading) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9090a8' }}>
          Завантаження кабінету учня...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '20px', borderRadius: '12px' }}>
          Не вдалося завантажити дані учня. Спробуйте оновити сторінку або повторити вхід.
        </div>
      </div>
    );
  }

  const { student, stats, recentResults, courses } = data;

  return (
    <div className={styles['student-dashboard-container']}>
      {/* Welcome Banner */}
      <div className={styles['welcome-banner']}>
        <div className={styles['welcome-text']}>
          <h2>Привіт, {student.firstName}! 👋</h2>
          <p className={styles['welcome-meta']}>
            Клас: <strong style={{ color: '#f0f0f5' }}>{student.classroomName}</strong> • Вчитель: <strong style={{ color: '#f0f0f5' }}>{student.teacherName}</strong>
          </p>
        </div>
        <Link
          to="/#enter-code"
          className={styles['btn-banner-join']}
        >
          Приєднатися до гри
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className={styles['stats-cards-grid']}>
        <div className={styles['stat-card']}>
          <div className={`${styles['stat-icon-wrapper']} ${styles['green']}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-val']}>{stats.totalQuizzesPassed}</span>
            <span className={styles['stat-lbl']}>Пройдено тестів</span>
          </div>
        </div>

        <div className={styles['stat-card']}>
          <div className={styles['stat-icon-wrapper']}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-val']}>
              {stats.averageGrade} <span style={{ fontSize: '1rem', color: '#9090a8' }}>/ 12</span>
            </span>
            <span className={styles['stat-lbl']}>Середня оцінка</span>
          </div>
        </div>

        <div className={styles['stat-card']}>
          <div className={`${styles['stat-icon-wrapper']} ${styles['blue']}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-val']}>{stats.coursesCount}</span>
            <span className={styles['stat-lbl']}>Мої курси</span>
          </div>
        </div>
      </div>

      {/* Recent Results Section */}
      <div className={styles['section-block']}>
        <div className={styles['section-title-row']}>
          <h3 className={styles['section-title']}>Останні результати тестувань</h3>
          <Link to="/student/history" className={styles['section-link']}>
            Вся історія →
          </Link>
        </div>

        {recentResults.length === 0 ? (
          <div style={{ background: '#1a1a26', border: '1px dashed #2a2a3a', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#9090a8' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: '#f0f0f5' }}>Ви ще не проходили жодного тесту</p>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Коли вчитель запустить сесію тестування, введіть код гри для участі</p>
          </div>
        ) : (
          <div className={classesStyles['history-list']}>
            {recentResults.map((item) => {
              const targetUuid = item.resultUuid || item.uuid;
              return (
                <div
                  key={item.uuid}
                  className={classesStyles['history-item']}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/student/results/${targetUuid}`)}
                >
                  <div className={classesStyles['history-info']}>
                    <span className={classesStyles['history-quiz-name']}>{item.quizTitle}</span>
                    <div className={classesStyles['history-meta']}>
                      <span>Дата: <strong>{item.date}</strong></span>
                      <span>Час: <strong>{item.joinTime}</strong></span>
                      <span>Курс: <strong>{item.courseName}</strong></span>
                      <span>Правильних: <strong>{item.correctAnswersCount} / {item.totalQuestionsCount}</strong></span>
                    </div>
                  </div>

                  <div className={classesStyles['history-grade-badge']}>
                    <span>Оцінка:</span>
                    <span>{item.grade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Courses Section */}
      <div className={styles['section-block']}>
        <div className={styles['section-title-row']}>
          <h3 className={styles['section-title']}>Мої предмети та курси</h3>
          <Link to="/student/courses" className={styles['section-link']}>
            Переглянути всі →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div style={{ background: '#1a1a26', border: '1px dashed #2a2a3a', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#9090a8' }}>
            Ви ще не записані до окремих курсів вашого класу
          </div>
        ) : (
          <div className={styles['courses-grid']}>
            {courses.map((course) => (
              <div key={course.uuid} className={styles['course-item-card']}>
                <div>
                  <h4 className={styles['course-item-name']}>{course.name}</h4>
                  <p className={styles['course-item-meta']}>
                    {course.roomsCount} сесій тестування
                  </p>
                </div>
                <div style={{ color: '#863bff', fontWeight: 700, fontSize: '0.85rem' }}>
                  Активний
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
