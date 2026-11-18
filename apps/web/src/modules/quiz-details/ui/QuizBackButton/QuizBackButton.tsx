import { ArrowLeftIcon } from '../../../../shared';
import type { QuizBackButtonProps } from './QuizBackButton.types';
import styles from './QuizBackButton.module.css';

export function QuizBackButton({
  onBack,
  label = 'Назад до списку вікторин',
}: QuizBackButtonProps) {
  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={onBack}
    >
      <ArrowLeftIcon size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
