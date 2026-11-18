import { Button } from '../../../../shared';
import type { QuizDetailsErrorProps } from './QuizDetailsError.types';
import styles from './QuizDetailsError.module.css';

export function QuizDetailsError({
  onGoHome,
  onRetry,
  title = 'Вікторину не знайдено',
  message = 'Можливо, вона була видалена або у вас немає прав на її перегляд.',
}: QuizDetailsErrorProps) {
  return (
    <div className={styles.errorCard} role="alert">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="primary" size="md" onClick={onGoHome}>
          Повернутися на головну
        </Button>
        <Button variant="secondary" size="md" onClick={onRetry}>
          Спробувати знову
        </Button>
      </div>
    </div>
  );
}
