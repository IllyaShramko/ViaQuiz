import { useState, useMemo, type FormEvent } from 'react';
import { useGetStudentResultsQuery } from '../../../modules/students';
import {
  StudentProgressChart,
  StudentGradeDistributionChart,
} from '../../../modules/classes';
import { DateFilterBar } from '../../../shared/ui';
import type { PerformanceDateFilterState } from './StudentPerformancePage.types';
import styles from './StudentPerformancePage.module.css';

const formatDateToInput = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = (): PerformanceDateFilterState => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  return {
    from: formatDateToInput(from),
    to: formatDateToInput(to),
  };
};

export function StudentPerformancePage() {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [fromDate, setFromDate] = useState(defaultDates.from);
  const [toDate, setToDate] = useState(defaultDates.to);
  const [appliedFilter, setAppliedFilter] = useState<PerformanceDateFilterState>(defaultDates);

  const { data, isLoading, isFetching } = useGetStudentResultsQuery({
    take: 100,
    skip: 0,
    from: appliedFilter.from,
    to: appliedFilter.to,
  });

  const handleApplyFilter = (e?: FormEvent) => {
    e?.preventDefault();
    setAppliedFilter({
      from: fromDate,
      to: toDate,
    });
  };

  const handleReset = () => {
    const defaults = getDefaultDateRange();
    setFromDate(defaults.from);
    setToDate(defaults.to);
    setAppliedFilter(defaults);
  };

  const rawResults = data?.results || [];

  // Filter chronologically and ensure results strictly match selected range
  const filteredResults = useMemo(() => {
    return rawResults.filter((r) => {
      if (appliedFilter.from && r.fullDate && r.fullDate < appliedFilter.from) return false;
      if (appliedFilter.to && r.fullDate && r.fullDate > appliedFilter.to) return false;
      return true;
    });
  }, [rawResults, appliedFilter]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    );
  }, [filteredResults]);

  const categories = sortedResults.map((r) => r.date);
  const grades = sortedResults.map((r) => r.grade);
  const quizTitles = sortedResults.map((r) => r.quizTitle);

  const gradeCounts: Record<string, number> = {};
  sortedResults.forEach((r) => {
    const key = `Оцінка ${r.grade}`;
    gradeCounts[key] = (gradeCounts[key] || 0) + 1;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Аналітика моєї успішності
        </h2>
        <p className={styles.subtitle}>
          Динаміка оцінок та загальний розподіл за результатами тестувань
        </p>
      </div>

      {isLoading ? (
        <div className={styles.loadingWrapper}>
          Завантаження графіків успішності...
        </div>
      ) : (
        <div className={styles.chartsGrid}>
          <StudentProgressChart
            categories={categories}
            grades={grades}
            quizTitles={quizTitles}
            title="Мій прогрес"
          />

          <StudentGradeDistributionChart
            labels={Object.keys(gradeCounts)}
            series={Object.values(gradeCounts)}
            title="Розподіл моїх оцінок"
          />
        </div>
      )}

      <div className={styles.filterSection}>
        <DateFilterBar
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onSubmit={handleApplyFilter}
          onReset={handleReset}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
