import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, pluralizeUk } from '../../../../shared';
import type { PerformanceOverviewProps } from './PerformanceOverview.types';
import styles from './PerformanceOverview.module.css';

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}.${month}.${year}`;
}

export function PerformanceOverview({
  classUuid,
  data,
  isLoading,
  isFetching,
  isError,
  emptyStudentsText = 'Додайте учнів, щоб відстежувати зведену активність.',
  preset,
  customFrom,
  customTo,
  appliedRange,
  isCustomInvalid,
  onSelectPreset,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
}: PerformanceOverviewProps) {
  const students = data?.students || [];
  const maxTests = students.reduce(
    (max, student) => Math.max(max, student.passedTests),
    0,
  );

  const activeRangeLabel = useMemo(() => {
    if (!appliedRange.from && !appliedRange.to) {
      return 'За весь час';
    }
    if (appliedRange.from && appliedRange.to) {
      return `${formatDisplayDate(appliedRange.from)} — ${formatDisplayDate(appliedRange.to)}`;
    }
    if (appliedRange.from) {
      return `З ${formatDisplayDate(appliedRange.from)}`;
    }
    return `До ${formatDisplayDate(appliedRange.to!)}`;
  }, [appliedRange]);

  const summary = data?.summary;
  const sessionsWord = pluralizeUk(summary?.totalSessions ?? 0, [
    'сесія',
    'сесії',
    'сесій',
  ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterRow}>
        <div
          className={styles.presetGroup}
          role="group"
          aria-label="Період статистики"
        >
          <button
            type="button"
            className={`${styles.presetBtn} ${preset === '7d' ? styles.isActive : ''}`}
            onClick={() => onSelectPreset('7d')}
          >
            7 днів
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${preset === '30d' ? styles.isActive : ''}`}
            onClick={() => onSelectPreset('30d')}
          >
            30 днів
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${preset === 'all' ? styles.isActive : ''}`}
            onClick={() => onSelectPreset('all')}
          >
            Весь час
          </button>
          <button
            type="button"
            className={`${styles.presetBtn} ${preset === 'custom' ? styles.isActive : ''}`}
            onClick={() => onSelectPreset('custom')}
          >
            Свій період
          </button>
        </div>

        {preset === 'custom' ? (
          <form className={styles.customForm} onSubmit={onApplyCustom}>
            <input
              type="date"
              className={styles.dateInput}
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              aria-label="Початкова дата"
            />
            <span className={styles.dateSeparator}>—</span>
            <input
              type="date"
              className={styles.dateInput}
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              aria-label="Кінцева дата"
            />
            <button
              type="submit"
              className={styles.applyBtn}
              disabled={isCustomInvalid || isFetching}
              title={
                isCustomInvalid
                  ? 'Початкова дата не може бути пізнішою за кінцеву'
                  : 'Застосувати обраний період'
              }
            >
              Застосувати
            </button>
          </form>
        ) : (
          <span className={styles.rangeLabel}>{activeRangeLabel}</span>
        )}
      </div>

      {isLoading ? (
        <div className={styles.stateCard}>Завантаження статистики...</div>
      ) : isError || !summary ? (
        <div className={styles.stateCard}>
          Не вдалося завантажити статистику успішності.
        </div>
      ) : (
        <div className={`${styles.content} ${isFetching ? styles.isFetching : ''}`}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Активні учні</span>
              <span className={styles.metricValue}>
                {summary.activeStudents} / {summary.totalStudents}
              </span>
              <span className={styles.metricSub}>пройшли хоча б 1 тестування</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Пройдено тестувань</span>
              <span className={styles.metricValue}>{summary.totalPassedTests}</span>
              <span className={styles.metricSub}>
                {summary.totalSessions} {sessionsWord} за період
              </span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Середній бал</span>
              <span className={styles.metricValue}>
                {summary.averageGrade > 0 ? `${summary.averageGrade} / 12` : '—'}
              </span>
              <span className={styles.metricSub}>
                {summary.totalPassedTests > 0
                  ? `точність відповідей ${summary.accuracyPercentage}%`
                  : 'немає пройдених тестів'}
              </span>
            </div>
          </div>

          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>Активність учнів</h3>
              <span className={styles.listHint}>
                Натисніть на учня для детальної аналітики
              </span>
            </div>

            {students.length === 0 ? (
              <div className={styles.emptyCard}>{emptyStudentsText}</div>
            ) : (
              students.map((student, index) => {
                const ratio =
                  maxTests > 0
                    ? Math.round((student.passedTests / maxTests) * 100)
                    : 0;
                const testsWord = pluralizeUk(student.passedTests, [
                  'тест',
                  'тести',
                  'тестів',
                ]);

                return (
                  <Link
                    key={student.uuid}
                    to={`/classes/${classUuid}/students/${student.uuid}`}
                    className={styles.studentRow}
                  >
                    <div className={styles.studentInfo}>
                      <span className={styles.studentRank}>{index + 1}</span>
                      <span className={styles.studentName}>
                        {student.lastName} {student.firstName}
                      </span>
                    </div>

                    <div className={styles.studentStats}>
                      {student.passedTests > 0 && (
                        <span className={styles.gradeText}>
                          {student.averageGrade} / 12
                        </span>
                      )}
                      <div className={styles.barTrack} aria-hidden="true">
                        <div
                          className={styles.barFill}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                      <span className={styles.testsCount}>
                        {student.passedTests} {testsWord}
                      </span>
                      <ArrowRightIcon size={15} className={styles.rowArrow} />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
