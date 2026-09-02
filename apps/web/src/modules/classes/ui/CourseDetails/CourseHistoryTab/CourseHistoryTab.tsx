import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTeacherSessionsQuery } from '../../../../reports';
import type { CourseHistoryTabProps } from './CourseHistoryTab.types';
import styles from './CourseHistoryTab.module.css';

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
    <div className={styles.container}>
      {/* Search & Stats Bar */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
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
            className={styles.searchInput}
          />
          {historySearchInput && (
            <button
              type="button"
              className={styles.searchClearBtn}
              onClick={() => setHistorySearchInput('')}
            >
              ✕
            </button>
          )}
        </div>

        {historyData && (
          <div className={styles.totalBadge}>
            Всього проведено: <strong>{historyData.total}</strong>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isHistoryLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Завантаження історії сесій курсу...</p>
        </div>
      )}

      {/* Error state */}
      {isHistoryError && (
        <div className={styles.error}>
          <p>Не вдалося завантажити історію сесій. Спробуйте оновити сторінку.</p>
        </div>
      )}

      {/* Empty state */}
      {!isHistoryLoading && !isHistoryError && (!historyData || historyData.sessions.length === 0) && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
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
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
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
                    className={styles.row}
                    onClick={() => navigate(`/reports/session/${session.roomUuid}`)}
                  >
                    <td className={styles.quizTitleCell}>
                      <span className={styles.quizName}>
                        {session.quizName || 'Вікторина'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.modeTag}>
                        {session.status === 'FINISHED' ? 'Завершено' : session.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles.participantsCount}>
                        👥 {session.participantsCount}
                      </span>
                    </td>
                    <td>
                      <div className={styles.accuracyCell}>
                        <div className={styles.accuracyBarBg}>
                          <div
                            className={styles.accuracyBarFill}
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
                        <span className={styles.accuracyText}>
                          {Math.round(session.avgPercentage)}%
                        </span>
                      </div>
                    </td>
                    <td className={styles.dateCell}>{formatDate(session.endedAt || session.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.btnViewReport}
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
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={historyPage === 1}
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              >
                ← Попередня
              </button>
              <span className={styles.paginationInfo}>
                Сторінка {historyPage} з {totalHistoryPages}
              </span>
              <button
                type="button"
                className={styles.paginationBtn}
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
