import styles from '../Dashboard.module.css';

export interface TeacherQuizSkeletonProps {}

export function TeacherQuizSkeleton(_props?: TeacherQuizSkeletonProps) {
  return (
    <div className={`${styles['teacher-quiz-card']} ${styles['teacher-quiz-card--skeleton']}`}>
      <div className={`${styles['teacher-quiz-card__header']} ${styles['teacher-quiz-card__header--skeleton']}`} />
      <div className={styles['teacher-quiz-card__body']}>
        <div className={`${styles['teacher-skeleton-line']} ${styles['teacher-skeleton-line--title']}`} />
        <div className={`${styles['teacher-skeleton-line']} ${styles['teacher-skeleton-line--author']}`} />
        <div className={`${styles['teacher-skeleton-line']} ${styles['teacher-skeleton-line--desc']}`} />
        <div className={`${styles['teacher-skeleton-line']} ${styles['teacher-skeleton-line--desc-short']}`} />
      </div>
    </div>
  );
}
