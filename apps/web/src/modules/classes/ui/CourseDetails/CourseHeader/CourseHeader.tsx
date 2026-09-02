import type { CourseHeaderProps } from './CourseHeader.types';
import styles from '../../Classes.module.css';

export function CourseHeader({ name, studentsCount, maxStudents = 50 }: CourseHeaderProps) {
  return (
    <div className={styles['classes-header']}>
      <h1 className={styles['classes-title']}>
        <span>{name}</span>
        <span className={styles['badge-limit']}>
          {studentsCount} / {maxStudents} учнів
        </span>
      </h1>
    </div>
  );
}
