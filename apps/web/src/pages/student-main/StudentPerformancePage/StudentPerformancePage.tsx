import { useGetStudentResultsQuery } from '../../../modules/students/api/studentsApi';
import { StudentProgressChart } from '../../../modules/classes/ui/Charts/StudentProgressChart';
import { StudentGradeDistributionChart } from '../../../modules/classes/ui/Charts/StudentGradeDistributionChart';
import styles from '../Student.module.css';
import classesStyles from '../../../modules/classes/ui/Classes.module.css';

export function StudentPerformancePage() {
  const { data, isLoading } = useGetStudentResultsQuery({ take: 50, skip: 0 });

  if (isLoading) {
    return (
      <div className={styles['student-dashboard-container']}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#9090a8' }}>
          Завантаження графіків успішності...
        </div>
      </div>
    );
  }

  const results = data?.results || [];

  // Build chart datasets from results (sorted chronologically)
  const sortedResults = [...results].sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
  );

  const categories = sortedResults.map((r) => r.date);
  const grades = sortedResults.map((r) => r.grade);
  const quizTitles = sortedResults.map((r) => r.quizTitle);

  const gradeCounts: Record<string, number> = {};
  sortedResults.forEach((r) => {
    const key = `Оцінка ${r.grade}`;
    gradeCounts[key] = (gradeCounts[key] || 0) + 1;
  });

  return (
    <div className={styles['student-dashboard-container']}>
      <div style={{ textAlign: 'center', margin: '0 0 10px 0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5', margin: 0 }}>
          Аналітика моєї успішності
        </h2>
        <p style={{ color: '#9090a8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
          Динаміка оцінок та загальний розподіл за результатами тестувань
        </p>
      </div>

      <div className={classesStyles['charts-grid']}>
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
    </div>
  );
};
