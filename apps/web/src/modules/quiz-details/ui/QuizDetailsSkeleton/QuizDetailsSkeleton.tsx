import styles from './QuizDetailsSkeleton.module.css';

export function QuizDetailsSkeleton() {
  return (
    <div className={styles.wrapper} aria-busy="true" aria-label="Завантаження вікторини">
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div className={`${styles.thumb} ${styles.shimmer}`} />
          <div className={styles.heroContent}>
            <div className={`${styles.line} ${styles.lineTitle} ${styles.shimmer}`} />
            <div className={`${styles.line} ${styles.lineDesc} ${styles.shimmer}`} />
          </div>
        </div>
        <div className={styles.metaBar}>
          <div className={`${styles.lineMeta} ${styles.shimmer}`} />
          <div className={`${styles.lineMeta} ${styles.shimmer}`} />
          <div className={`${styles.lineMeta} ${styles.shimmer}`} />
        </div>
      </div>

      <div className={`${styles.launchBar} ${styles.shimmer}`} />
      <div className={`${styles.questionCard} ${styles.shimmer}`} />
      <div className={`${styles.questionCard} ${styles.shimmer}`} />
    </div>
  );
}
