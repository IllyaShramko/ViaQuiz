import { useNavigate } from 'react-router-dom';
import { useGetStudentResultsQuery } from '../../../modules/students/api/studentsApi';
import styles from '../Student.module.css';
import classesStyles from '../../../modules/classes/ui/Classes.module.css';

export function StudentHistoryPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetStudentResultsQuery({ take: 50, skip: 0 });

  if (isLoading) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9090a8' }}>
          Завантаження історії тестувань...
        </div>
      </div>
    );
  }

  const results = data?.results || [];

  return (
    <div className={styles['student-dashboard-container']}>
      <div className={classesStyles['history-section']}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f0f5', margin: '0 0 8px 0' }}>
          Вся історія проходжень ({results.length})
        </h2>

        {results.length === 0 ? (
          <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9090a8' }}>
            Ви ще не пройшли жодного тесту
          </div>
        ) : (
          <div className={classesStyles['history-list']}>
            {results.map((item) => {
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
                      <span>Предмет: <strong>{item.courseName}</strong></span>
                      <span>Правильних відповідей: <strong>{item.correctAnswersCount} / {item.totalQuestionsCount}</strong></span>
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
    </div>
  );
};
