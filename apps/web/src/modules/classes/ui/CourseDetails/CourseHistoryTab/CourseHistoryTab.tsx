import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTeacherSessionsQuery } from '../../../../reports';
import type { CourseHistoryTabProps } from './CourseHistoryTab.types';
import styles from '../../Classes.module.css';

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

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className={styles['history-tab-content']}>
      {/* Search & Stats Bar */}
      <div className={styles['history-controls']}>
        <div className={styles['search-box']}>
          <svg
            className={styles['search-icon']}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Пошук за назвою вікторини..."
            value={historySearchInput}
            onChange={(e) => setHistorySearchInput(e.target.value)}
            className={styles['search-input']}
          />
          {historySearchInput && (
            <button
              type="button"
              className={styles['search-clear-btn']}
              onClick={() => setHistorySearchInput('')}
            >
              ✕
            </button>
          )}
        </div>

        {historyData && (
          <div className={styles['history-total-badge']}>
            Всього проведено: <strong>{historyData.total}</strong>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isHistoryLoading && (
        <div className={styles['history-loading']}>
          <div className={styles['loading-spinner']} />
          <p>Завантаження історії сесій курсу...</p>
        </div>
      )}

      {/* Error state */}
      {isHistoryError && (
        <div className={styles['history-error']}>
          <p>Не вдалося завантажити історію сесій. Спробуйте оновити сторінку.</p>
        </div>
      )}

      {/* Empty state */}
      {!isHistoryLoading && !isHistoryError && (!historyData || historyData.sessions.length === 0) && (
        <div className={styles['history-empty']}>
          <div className={styles['empty-icon']}>📋</div>
          <h4>Сесій ще не проводилося</h4>
          <p>
            {historySearchQuery
              ? 'За вашим запитом нічого не знайдено.'
              : 'Учні цього курсу ще не брали участі у вікторинах із цим курсом.'}
          </p>
        </div>
      )}

      {/* Table list */}
      {!isHistoryLoading && !isHistoryError && historyData && historyData.sessions.length > 0 && (
        <>
          <div className={styles['history-table-wrapper']}>
            <table className={styles['history-table']}>
              <thead>
                <tr>
                  <th>Вікторина</th>
                  <th>Статус</th>
                  <th>Учасників</th>
                  <th>Середній результат</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {historyData.sessions.map((session) => (
                  <tr
                    key={session.roomUuid || session.roomId}
                    className={styles['history-row']}
                    onClick={() => navigate(`/reports/session/${session.roomUuid}`)}
                  >
                    <td className={styles['quiz-title-cell']}>
                      <span className={styles['quiz-name']}>
                        {session.quizName || 'Вікторина'}
                      </span>
                    </td>
                    <td>
                      <span className={styles['mode-tag']}>
                        {session.status === 'FINISHED' ? 'Завершено' : session.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles['participants-count']}>
                        👥 {session.participantsCount}
                      </span>
                    </td>
                    <td>
                      <div className={styles['accuracy-cell']}>
                        <div className={styles['accuracy-bar-bg']}>
                          <div
                            className={styles['accuracy-bar-fill']}
                            style={{
                              width: `${Math.round(session.avgPercentage)}%`,
                              backgroundColor:
                                session.avgPercentage >= 70
                                  ? '#22c55e'
                                  : session.avgPercentage >= 40
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          />
                        </div>
                        <span className={styles['accuracy-text']}>
                          {Math.round(session.avgPercentage)}%
                        </span>
                      </div>
                    </td>
                    <td className={styles['date-cell']}>{formatDate(session.endedAt || session.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className={styles['btn-view-report']}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reports/session/${session.roomUuid}`);
                        }}
                      >
                        Звіт →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalHistoryPages > 1 && (
            <div className={styles['history-pagination']}>
              <button
                type="button"
                className={styles['pagination-btn']}
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              >
                ← Попередня
              </button>
              <span className={styles['pagination-info']}>
                Сторінка {historyPage} з {totalHistoryPages}
              </span>
              <button
                type="button"
                className={styles['pagination-btn']}
                disabled={historyPage === totalHistoryPages}
                onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
              >
                Наступна →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
