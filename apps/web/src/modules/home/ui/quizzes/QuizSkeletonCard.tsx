import styles from '../Home.module.css';

export function QuizSkeletonCard() {
  return (
    <div className={`${styles['quiz-card']} ${styles['quiz-card--skeleton']}`}>
      <div className={`${styles['quiz-card__header']} ${styles['quiz-card__header--skeleton']}`} />
      <div className={styles['quiz-card__body']}>
        <div className={`${styles['skeleton-line']} ${styles['skeleton-line--title']}`} />
        <div className={`${styles['skeleton-line']} ${styles['skeleton-line--author']}`} />
        <div className={`${styles['skeleton-line']} ${styles['skeleton-line--desc']}`} />
        <div className={`${styles['skeleton-line']} ${styles['skeleton-line--desc-short']}`} />
      </div>
    </div>
  );
}
