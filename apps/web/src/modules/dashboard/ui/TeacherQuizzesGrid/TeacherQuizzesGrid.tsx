import type { TeacherQuizzesGridProps } from './TeacherQuizzesGrid.types';
import { TeacherQuizCard } from '../TeacherQuizCard';
import { TeacherQuizSkeleton } from '../TeacherQuizSkeleton';
import { TeacherEmptyState } from '../TeacherEmptyState';
import styles from '../Dashboard.module.css';

export function TeacherQuizzesGrid({
  quizzes,
  isLoading,
  isError,
  skeletonCount = 6,
  onCardClick,
  onRetry,
}: TeacherQuizzesGridProps) {
  if (isLoading) {
    return (
      <div className={styles['teacher-quizzes-grid']}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <TeacherQuizSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <TeacherEmptyState
        isError
        title="Помилка завантаження"
        message="Не вдалося отримати список вікторин. Спробуйте оновити сторінку."
        onRetry={onRetry}
      />
    );
  }

  if (quizzes.length === 0) {
    return (
      <TeacherEmptyState
        title="Нічого не знайдено"
        message="Спробуйте змінити пошуковий запит або створіть власну вікторину."
      />
    );
  }

  return (
    <div className={styles['teacher-quizzes-grid']}>
      {quizzes.map((quiz, index) => (
        <TeacherQuizCard
          key={quiz.uuid || quiz.id}
          quiz={quiz}
          index={index}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
