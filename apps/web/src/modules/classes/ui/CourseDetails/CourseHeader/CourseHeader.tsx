import type { CourseHeaderProps } from './CourseHeader.types';
import styles from './CourseHeader.module.css';

export function CourseHeader({ name, studentsCount, maxStudents = 50 }: CourseHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.titleRow}>
        <span>{name}</span>
        <span className={styles.capacityBadge}>
          {studentsCount} / {maxStudents} учнів
        </span>
      </h1>
    </div>
  );
}
