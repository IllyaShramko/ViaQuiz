import styles from '../Library.module.css';

export interface LibraryHeaderProps {
  onCreateQuiz: () => void;
}

export function LibraryHeader({ onCreateQuiz }: LibraryHeaderProps) {
  return (
    <div className={styles['library-header']}>
      <div className={styles['library-header__left']}>
        <h1 className={styles['library-header__title']}>Бібліотека</h1>
        <p className={styles['library-header__subtitle']}>
          Керуйте своїми створеними вікторинами та переглядайте збережене
        </p>
      </div>

      <button
        type="button"
        className={styles['library-header__create-btn']}
        onClick={onCreateQuiz}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Створити вікторину</span>
      </button>
    </div>
  );
}
