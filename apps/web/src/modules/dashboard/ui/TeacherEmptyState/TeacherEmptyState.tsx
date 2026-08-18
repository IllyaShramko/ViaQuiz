import styles from '../Dashboard.module.css';

export interface TeacherEmptyStateProps {
  title?: string;
  message?: string;
  isError?: boolean;
  onRetry?: () => void;
}

export function TeacherEmptyState({
  title = 'Нічого не знайдено',
  message = 'Спробуйте змінити пошуковий запит або створіть власну вікторину.',
  isError = false,
  onRetry,
}: TeacherEmptyStateProps) {
  return (
    <div className={isError ? styles['teacher-quizzes-error'] : styles['teacher-quizzes-empty']}>
      <h3>{title}</h3>
      <p>{message}</p>
      {isError && onRetry && (
        <button
          type="button"
          className="btn btn--primary"
          onClick={onRetry}
          style={{ marginTop: '1rem' }}
        >
          Спробувати знову
        </button>
      )}
    </div>
  );
}
