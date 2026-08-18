import styles from '../QuizDetails.module.css';

export function QuizDetailsSkeleton() {
  return (
    <div className={styles['quiz-details-skeleton']}>
      <div className={styles['quiz-details-skeleton__hero']}>
        <div className={styles['quiz-details-skeleton__thumb']} />
        <div className={styles['quiz-details-skeleton__content']}>
          <div className={`${styles['quiz-details-skeleton__line']} ${styles['title']}`} />
          <div className={`${styles['quiz-details-skeleton__line']} ${styles['desc']}`} />
          <div className={`${styles['quiz-details-skeleton__line']} ${styles['meta']}`} />
        </div>
      </div>
    </div>
  );
}
