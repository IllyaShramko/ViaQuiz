import { useParams, Link } from 'react-router-dom';
import { useGetResultReportByUuidQuery } from '../../../modules/game-session';
import { StudentResultReport } from '../../../modules/students/ui/StudentResultReport';
import { NotFoundHeader } from '../../../modules/not-found/ui/NotFoundHeader';
import styles from '../../../modules/students/ui/StudentResultReport/StudentResultReport.module.css';
import { getAuthToken } from '../../../shared/api/headers';

export function StudentResultReportPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const token = getAuthToken();
  const homePath = token ? '/student/dashboard' : '/';

  const { data: report, isLoading, isError } = useGetResultReportByUuidQuery(uuid || '', {
    skip: !uuid,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className={styles['report-container']}>
        <NotFoundHeader homePath={homePath} />
        <div className={styles['state-container']}>
          <div className={styles['state-spinner']} />
          <h2 className={styles['state-title']}>Завантаження результатів...</h2>
          <p className={styles['state-description']}>Будь ласка, зачекайте, формуємо звіт проходження тесту.</p>
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className={styles['report-container']}>
        <NotFoundHeader homePath={homePath} />
        <div className={styles['state-container']}>
          <h2 className={styles['state-title']}>Звіт не знайдено</h2>
          <p className={styles['state-description']}>
            Не вдалося знайти результати за цим посиланням або сталася помилка.
          </p>
          <Link to={homePath} className={styles['state-button']}>
            Повернутися на головну
          </Link>
        </div>
      </div>
    );
  }

  return <StudentResultReport report={report} homePath={homePath} />;
}
