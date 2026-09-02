import type { LibraryEmptyStateProps } from './LibraryEmptyState.types';
import styles from '../Library.module.css';

export function LibraryEmptyState({
  isLikedTab = false,
  hasSearch = false,
  onCreateQuiz,
  onExplore,
}: LibraryEmptyStateProps) {
  if (hasSearch) {
    return (
      <div className={styles['library-empty-state']}>
        <div className={styles['library-empty-state__icon-wrap']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className={styles['library-empty-state__title']}>Нічого не знайдено</h3>
        <p className={styles['library-empty-state__desc']}>
          За вашим пошуковим запитом не знайдено жодної вікторини. Спробуйте змінити ключові слова.
        </p>
      </div>
    );
  }

  if (isLikedTab) {
    return (
      <div className={styles['library-empty-state']}>
        <div className={styles['library-empty-state__icon-wrap']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 className={styles['library-empty-state__title']}>Немає вподобаних вікторин</h3>
        <p className={styles['library-empty-state__desc']}>
          Знаходьте цікаві вікторини у загальному каталозі та додавайте їх до обраного, натискаючи на сердечко.
        </p>
        {onExplore && (
          <button
            type="button"
            className={styles['library-empty-state__btn']}
            onClick={onExplore}
          >
            Перейти до каталогу
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles['library-empty-state']}>
      <div className={styles['library-empty-state__icon-wrap']}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h3 className={styles['library-empty-state__title']}>У вас ще немає вікторин</h3>
      <p className={styles['library-empty-state__desc']}>
        Створіть свою першу вікторину, додайте питання та діліться нею з учнями або колегами!
      </p>
      {onCreateQuiz && (
        <button
          type="button"
          className={styles['library-empty-state__btn']}
          onClick={onCreateQuiz}
        >
          Створити першу вікторину
        </button>
      )}
    </div>
  );
}
