import type { QuizBackButtonProps } from './QuizBackButton.types';
import styles from '../QuizDetails.module.css';

export function QuizBackButton({
  onBack,
  label = 'Назад до списку вікторин',
}: QuizBackButtonProps) {
  return (
    <button
      type="button"
      className={styles['quiz-details-back-btn']}
      onClick={onBack}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
