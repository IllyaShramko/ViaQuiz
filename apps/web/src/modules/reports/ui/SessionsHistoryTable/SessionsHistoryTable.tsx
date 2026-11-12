import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTeacherSessionsQuery } from '../../api';
import { SearchInput } from '../../../../shared';
import type { SessionsHistoryTableProps } from './SessionsHistoryTable.types';
import styles from './SessionsHistoryTable.module.css';

export function SessionsHistoryTable({
  classUuid,
  courseUuid,
  searchPlaceholder = 'Пошук звітів...',
}: SessionsHistoryTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError } = useGetTeacherSessionsQuery({
    page,
    pageSize: 10,
    search: searchQuery || undefined,
    classUuid,
    courseUuid,
  });

  const handlePrevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const handleNextPage = useCallback(() => {
    if (data && data.total > page * data.pageSize) {
      setPage((p) => p + 1);
    }
  }, [data, page]);

  const formatDate = (isoString: string | null) => {
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

  const showCourseOrClassCol = !courseUuid;
  const courseColLabel = classUuid ? 'Курс' : 'Клас/Курс';

  return (
    <div className={styles.container}>
      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        placeholder={searchPlaceholder}
        maxWidth={360}
      />

      {isLoading && <p>Завантаження...</p>}
      {isError && <p>Помилка при завантаженні звітів.</p>}

      {!isLoading && !isError && data && (
        <>
          {data.sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Сесій не знайдено</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <colgroup>
                  <col className={styles.colQuizName} />
                  {showCourseOrClassCol && <col className={styles.colCourseOrClass} />}
                  <col className={styles.colParticipants} />
                  <col className={styles.colAvgScore} />
                  <col className={styles.colAvgPercent} />
                  <col className={styles.colDate} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Назва гри</th>
                    {showCourseOrClassCol && <th>{courseColLabel}</th>}
                    <th>Учасники</th>
                    <th>Сер. бал</th>
                    <th>Сер. %</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((session) => (
                    <tr
                      key={session.roomUuid}
                      className={styles.row}
                      onClick={() => navigate(`/dashboard/reports/${session.roomUuid}`)}
                    >
                      <td className={styles.quizNameCell}>{session.quizName}</td>
                      {showCourseOrClassCol && (
                        <td>
                          {classUuid
                            ? session.courseName || '—'
                            : session.courseName
                              ? `${session.courseName}${session.groupName ? ` (${session.groupName})` : ''}`
                              : session.groupName
                                ? `(${session.groupName})`
                                : '—'}
                        </td>
                      )}
                      <td className={styles.nowrapCell}>{session.participantsCount}</td>
                      <td className={styles.nowrapCell}>{session.avgScore.toFixed(1)}</td>
                      <td className={styles.nowrapCell}>{session.avgPercentage}%</td>
                      <td className={styles.nowrapCell}>{formatDate(session.endedAt || session.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.total > data.pageSize && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={page === 1}
                onClick={handlePrevPage}
              >
                Назад
              </button>
              <span className={styles.paginationInfo}>Сторінка {page}</span>
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={page * data.pageSize >= data.total}
                onClick={handleNextPage}
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
