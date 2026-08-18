import React from 'react';
import { PlusIcon } from '../../../../shared';
import styles from '../Drafts.module.css';

export interface DraftCreateCardProps {
  canCreateMore: boolean;
  isCreating: boolean;
  maxDrafts?: number;
  onCreate: () => void;
}

export function DraftCreateCard({
  canCreateMore,
  isCreating,
  maxDrafts = 3,
  onCreate,
}: DraftCreateCardProps) {
  if (!canCreateMore) {
    return (
      <div className={styles['draft-limit-card']}>
        <div className={styles['draft-limit-card__inner']}>
          <span className={styles['limit-icon']}>⚠️</span>
          <span className={styles['limit-title']}>Ліміт вичерпано</span>
          <span className={styles['limit-desc']}>
            У вас уже створено {maxDrafts} чернетки. Опублікуйте або видаліть одну з них для створення нової.
          </span>
        </div>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCreate();
    }
  };

  return (
    <div
      className={`${styles['draft-create-card']} ${isCreating ? styles['is-loading'] : ''}`}
      onClick={onCreate}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles['draft-create-card__inner']}>
        {isCreating ? (
          <>
            <div className={styles['drafts-spinner']} />
            <span className={styles['create-text-main']}>Створення...</span>
          </>
        ) : (
          <>
            <div className={styles['create-icon-bubble']}>
              <PlusIcon width={32} height={32} />
            </div>
            <span className={styles['create-text-main']}>+ Створити новий квіз</span>
            <span className={styles['create-text-sub']}>Почати з чистого аркуша</span>
          </>
        )}
      </div>
    </div>
  );
}
