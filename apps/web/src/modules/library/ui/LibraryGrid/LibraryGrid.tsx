import type { LibraryGridProps } from './LibraryGrid.types';
import { LibraryQuizCard } from '../LibraryQuizCard';
import { LibraryEmptyState } from '../LibraryEmptyState';
import styles from '../Library.module.css';

export function LibraryGrid({
  quizzes,
  isLoading,
  isError,
  isLikedTab = false,
  hasSearch = false,
  onCardClick,
  onEdit,
  onDelete,
  onUnlike,
  onCreateQuiz,
  onExplore,
  onRetry,
}: LibraryGridProps) {
  if (isLoading) {
    return (
      <div className={styles['library-grid']}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles['library-skeleton-card']}>
            <div className={styles['library-skeleton-cover']} />
            <div className={styles['library-skeleton-body']}>
              <div className={styles['library-skeleton-line']} style={{ width: '70%', height: 18 }} />
              <div className={styles['library-skeleton-line']} style={{ width: '40%' }} />
              <div className={styles['library-skeleton-line']} style={{ width: '90%' }} />
              <div className={styles['library-skeleton-line']} style={{ width: '30%', marginTop: '0.5rem' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['library-empty-state']}>
        <div className={styles['library-empty-state__icon-wrap']} style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className={styles['library-empty-state__title']}>Помилка завантаження</h3>
        <p className={styles['library-empty-state__desc']}>
          Не вдалося отримати список вікторин. Перевірте з'єднання з інтернетом та спробуйте ще раз.
        </p>
        {onRetry && (
          <button
            type="button"
            className={styles['library-empty-state__btn']}
            onClick={onRetry}
          >
            Спробувати знову
          </button>
        )}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <LibraryEmptyState
        isLikedTab={isLikedTab}
        hasSearch={hasSearch}
        onCreateQuiz={onCreateQuiz}
        onExplore={onExplore}
      />
    );
  }

  return (
    <div className={styles['library-grid']}>
      {quizzes.map((quiz, index) => (
        <LibraryQuizCard
          key={quiz.uuid || quiz.id}
          quiz={quiz}
          index={index}
          isLikedTab={isLikedTab}
          onClick={onCardClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onUnlike={onUnlike}
        />
      ))}
    </div>
  );
}
