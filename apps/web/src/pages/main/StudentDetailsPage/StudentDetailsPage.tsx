import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetStudentAnalyticsQuery } from '../../../modules/classes/api/classesApi';
import { StudentProgressChart } from '../../../modules/classes/ui/Charts/StudentProgressChart';
import { StudentGradeDistributionChart } from '../../../modules/classes/ui/Charts/StudentGradeDistributionChart';
import { ResetPasswordModal } from '../../../modules/classes/ui/ResetPasswordModal/ResetPasswordModal';
import styles from '../../../modules/classes/ui/Classes.module.css';

export function StudentDetailsPage() {
  const { classUuid, studentUuid } = useParams<{ classUuid: string; studentUuid: string }>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFilter, setAppliedFilter] = useState<{ from?: string; to?: string }>({});
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useGetStudentAnalyticsQuery(
    {
      classUuid: classUuid || '',
      studentUuid: studentUuid || '',
      from: appliedFilter.from,
      to: appliedFilter.to,
    },
    { skip: !classUuid || !studentUuid },
  );

  const handleApplyFilter = (e: FormEvent) => {
    e.preventDefault();
    setAppliedFilter({
      from: fromDate || undefined,
      to: toDate || undefined,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className={styles['classes-container']}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9090a8' }}>
          Завантаження аналітики учня...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles['classes-container']}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '20px', borderRadius: '12px' }}>
          Не вдалося завантажити дані учня.
          <br />
          <button
            type="button"
            onClick={() => navigate(classUuid ? `/classes/${classUuid}` : '/classes')}
            className={styles['btn-secondary']}
            style={{ marginTop: '12px' }}
          >
            ← Повернутися до класу
          </button>
        </div>
      </div>
    );
  }

  const { student, stats, charts, history } = data;

  return (
    <div className={styles['classes-container']}>
      {/* Header matching Screenshot 1 */}
      <div className={styles['student-detail-header']}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className={styles['action-icon-btn']}
            onClick={() => navigate(`/classes/${classUuid}`)}
            title="Назад до класу"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className={styles['student-detail-title']}>
            Учень: {student.lastName} {student.firstName}
          </h1>
        </div>

        <button
          type="button"
          className={styles['btn-forgot-password']}
          onClick={() => setIsResetModalOpen(true)}
        >
          Забув пароль?
        </button>
      </div>

      <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f0f5', margin: 0 }}>
          Загальні результати учня
        </h2>
        <p style={{ color: '#9090a8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
          Клас: {student.classroomName} • Логін: <span style={{ fontFamily: 'monospace', color: '#863bff' }}>{student.login}</span> • Середня оцінка: <span style={{ color: '#22c55e', fontWeight: 700 }}>{stats.averageGrade} / 12</span>
        </p>
      </div>

      {/* Charts Block with ApexCharts matching Screenshot 1 */}
      <div className={styles['charts-grid']}>
        <StudentProgressChart
          categories={charts.progress.categories}
          grades={charts.progress.grades}
          quizTitles={charts.progress.quizTitles}
          title="Прогрес"
        />

        <StudentGradeDistributionChart
          labels={charts.distribution.labels}
          series={charts.distribution.series}
          title="Оцінки"
        />
      </div>

      {/* Date Filter Bar matching Screenshot 1 */}
      <form className={styles['date-filter-bar']} onSubmit={handleApplyFilter}>
        <input
          type="date"
          className={styles['date-input']}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          aria-label="Початкова дата"
        />
        <span style={{ color: '#9090a8', fontWeight: 700 }}>—</span>
        <input
          type="date"
          className={styles['date-input']}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          aria-label="Кінцева дата"
        />
        <button type="submit" className={styles['btn-update-data']}>
          Оновити дані
        </button>
      </form>

      {/* Test History Section matching Screenshot 1 */}
      <div className={styles['history-section']}>
        <h3 className={styles['history-title']}>Історія проходжень тестувань:</h3>

        {history.length === 0 ? (
          <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#9090a8' }}>
            За обраний період тестувань не знайдено
          </div>
        ) : (
          <div className={styles['history-list']}>
            {history.map((item) => (
              <div key={item.uuid} className={styles['history-item']}>
                <div className={styles['history-info']}>
                  <span className={styles['history-quiz-name']}>{item.quizTitle}</span>
                  <div className={styles['history-meta']}>
                    <span>Дата: <strong>{item.date}</strong></span>
                    <span>Час приєднання: <strong>{item.joinTime}</strong></span>
                    <span>Предмет/курс: <strong>{item.courseName}</strong></span>
                    <span>Правильних: <strong>{item.correctAnswersCount} / {item.totalQuestionsCount}</strong></span>
                  </div>
                </div>

                <div className={styles['history-grade-badge']}>
                  <span>Оцінка:</span>
                  <span>{item.grade}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <ResetPasswordModal
          classUuid={classUuid!}
          studentUuid={student.uuid}
          studentName={`${student.lastName} ${student.firstName}`}
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
        />
      )}
    </div>
  );
};
