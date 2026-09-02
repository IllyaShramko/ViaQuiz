import { Link } from 'react-router-dom';
import type { AssignedCourseCardProps } from './AssignedCourseCard.types';
import styles from './AssignedCourseCard.module.css';

export function AssignedCourseCard({
  course,
  onLeaveCourse,
}: AssignedCourseCardProps) {
  const curatorName =
    course.creator.firstName && course.creator.lastName
      ? `${course.creator.firstName} ${course.creator.lastName}`
      : `@${course.creator.login}`;

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.courseHeader}>
          <h3 className={styles.courseName}>{course.name}</h3>
          <div className={styles.classBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Клас: {course.classroom.name}</span>
          </div>
          <span className={styles.curatorText}>
            Куратор:{' '}
            <strong className={styles.curatorHighlight}>{curatorName}</strong>
          </span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Учнів</span>
          <span className={styles.statValue}>{course._count.students}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Тестувань</span>
          <span className={styles.statValue}>{course._count.rooms}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <Link
          to={`/classes/${course.classroom.uuid}/courses/${course.uuid}`}
          className={styles.viewLink}
        >
          <span>Відкрити курс</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        <button
          type="button"
          className={styles.leaveButton}
          onClick={() =>
            onLeaveCourse(course.classroom.uuid, course.uuid, course.name)
          }
          title="Покинути керівництво цим курсом"
        >
          Покинути курс
        </button>
      </div>
    </div>
  );
}
