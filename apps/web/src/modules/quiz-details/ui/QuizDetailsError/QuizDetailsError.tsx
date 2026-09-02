import type { QuizDetailsErrorProps } from './QuizDetailsError.types';
import styles from '../QuizDetails.module.css';

export function QuizDetailsError({
  onGoHome,
  onRetry,
  title = 'Вікторину не знайдено',
  message = 'Можливо, вона була видалена або у вас немає прав на її перегляд.',
}: QuizDetailsErrorProps) {
  return (
    <div className={styles['quiz-details-error']}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className={styles['quiz-details-error__actions']}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onGoHome}
        >
          Повернутися на головну
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onRetry}
        >
          Спробувати знову
        </button>
      </div>
    </div>
  );
}
