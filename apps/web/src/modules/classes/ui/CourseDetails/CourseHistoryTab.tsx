import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTeacherSessionsQuery } from '../../../reports';
import styles from '../Classes.module.css';

interface CourseHistoryTabProps {
  courseUuid: string;
}

export function CourseHistoryTab({ courseUuid }: CourseHistoryTabProps) {
  const navigate = useNavigate();
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearchInput, setHistorySearchInput] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setHistorySearchQuery(historySearchInput);
      setHistoryPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [historySearchInput]);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useGetTeacherSessionsQuery(
    {
      page: historyPage,
      pageSize: 10,
      search: historySearchQuery || undefined,
      courseUuid,
    },
    { skip: !courseUuid },
  );

  const totalHistoryPages = historyData
    ? Math.ceil(historyData.total / historyData.pageSize) || 1
    : 1;

  const handlePrevHistoryPage = () => setHistoryPage((p) => Math.max(1, p - 1));
  const handleNextHistoryPage = () => {
    if (historyData && historyPage < totalHistoryPages) {
      setHistoryPage((p) => p + 1);
    }
  };

  const formatSessionDate = (isoString: string | null) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles['history-tab-wrapper']}>
      <div className={styles['history-tab-header']}>
        <div className={styles['reports-search-box']}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Пошук тестувань курсу..."
            value={historySearchInput}
            onChange={(e) => setHistorySearchInput(e.target.value)}
          />
          {historySearchInput && (
            <button
              type="button"
              onClick={() => setHistorySearchInput('')}
              style={{ background: 'none', border: 'none', color: '#9090a8', cursor: 'pointer', padding: 0 }}
              aria-label="Очистити пошук"
            >
              ✕
            </button>
          )}
        </div>
        {historyData && (
          <div style={{ color: '#9090a8', fontSize: '0.9rem' }}>
            Всього сесій курсу: <strong style={{ color: '#f0f0f5' }}>{historyData.total}</strong>
          </div>
        )}
      </div>

      {isHistoryLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9090a8' }}>
          Завантаження історії тестувань курсу...
        </div>
      )}

      {isHistoryError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          Помилка при завантаженні історії тестувань курсу.
        </div>
      )}

      {!isHistoryLoading && !isHistoryError && historyData && (
        <>
          {historyData.sessions.length === 0 ? (
            <div
              style={{
                background: '#1a1a26',
                border: '1px dashed #2a2a3a',
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#9090a8',
              }}
            >
              <h3 style={{ color: '#f0f0f5', margin: '0 0 8px 0' }}>
                {historySearchQuery ? 'Сесій не знайдено' : 'Історія тестувань курсу порожня'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {historySearchQuery
                  ? 'За вашим пошуковим запитом тестувань не знайдено.'
                  : 'Тут відображатимуться завершені сесії вікторин, що проводилися саме для цього курсу.'}
              </p>
            </div>
          ) : (
            <div className={styles['students-table-card']}>
              <table className={styles['students-table']}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>№</th>
                    <th>Назва гри</th>
                    <th>Учасники</th>
                    <th>Сер. бал</th>
                    <th>Сер. %</th>
                    <th>Дата завершення</th>
                    <th style={{ textAlign: 'right' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.sessions.map((session, index) => {
                    const itemNumber = (historyPage - 1) * historyData.pageSize + index + 1;
                    return (
                      <tr
                        key={session.roomUuid}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/dashboard/reports/${session.roomUuid}`)}
                      >
                        <td style={{ color: '#9090a8', fontWeight: 600 }}>{itemNumber}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#f0f0f5' }}>{session.quizName}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{session.participantsCount}</span>
                        </td>
                        <td>
                          <span style={{ color: '#22c55e', fontWeight: 700 }}>
                            {session.avgScore.toFixed(1)} / 12
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                session.avgPercentage >= 70
                                  ? '#22c55e'
                                  : session.avgPercentage >= 40
                                  ? '#f59e0b'
                                  : '#ef4444',
                            }}
                          >
                            {session.avgPercentage}%
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#9090a8', fontSize: '0.85rem' }}>
                            {formatSessionDate(session.endedAt || session.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className={styles['table-actions']}>
                            <button
                              type="button"
                              className={styles['action-icon-btn']}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/reports/${session.roomUuid}`);
                              }}
                              title="Переглянути детальний звіт"
                            >
                              Звіт →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {historyData.total > historyData.pageSize && (
            <div className={styles['reports-pagination']}>
              <button
                type="button"
                className={styles['reports-pagination-btn']}
                disabled={historyPage === 1}
                onClick={handlePrevHistoryPage}
              >
                Назад
              </button>
              <span className={styles['reports-pagination-info']}>
                Сторінка {historyPage} з {totalHistoryPages}
              </span>
              <button
                type="button"
                className={styles['reports-pagination-btn']}
                disabled={historyPage >= totalHistoryPages}
                onClick={handleNextHistoryPage}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
