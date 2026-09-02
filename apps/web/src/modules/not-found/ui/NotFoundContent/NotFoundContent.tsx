import type { NotFoundContentProps } from './NotFoundContent.types';
import styles from '../NotFound.module.css';

export function NotFoundContent({
  onNavigateHome,
  titleDigits = ['4', '0', '4'],
  message = 'Упс! Сторінку не знайдено...',
  buttonText = 'На головну',
}: NotFoundContentProps) {
  return (
    <main className={styles['not-found-main']}>
      <div className={styles['not-found-content']}>
        <div className={styles['not-found-glitch-wrapper']}>
          <h1 className={styles['not-found-code']}>
            <span className={`${styles['digit']} ${styles['digit-1']}`}>{titleDigits[0]}</span>
            <span className={`${styles['digit']} ${styles['digit-0']}`}>{titleDigits[1]}</span>
            <span className={`${styles['digit']} ${styles['digit-2']}`}>{titleDigits[2]}</span>
          </h1>
        </div>

        <h2 className={styles['not-found-message']}>{message}</h2>

        <button
          type="button"
          className={styles['not-found-action-btn']}
          onClick={onNavigateHome}
        >
          {buttonText}
        </button>
      </div>
    </main>
  );
}
