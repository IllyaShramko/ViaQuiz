import type { TeacherQuizzesHeaderProps } from './TeacherQuizzesHeader.types';
import styles from '../Dashboard.module.css';

export function TeacherQuizzesHeader({
  title = 'Опубліковані вікторини',
  total,
}: TeacherQuizzesHeaderProps) {
  return (
    <div className={styles['teacher-quizzes-header']}>
      <h3 className={styles['teacher-quizzes-header__title']}>{title}</h3>
      {typeof total === 'number' && (
        <span className={styles['teacher-quizzes-count']}>Знайдено: {total}</span>
      )}
    </div>
  );
}
