import React from 'react';
import type { EditorQuiz } from '../../models/types';
import { DraftCard } from '../DraftCard';
import { DraftCreateCard } from '../DraftCreateCard';
import type { DraftSortField } from '../DraftsToolbar';
import styles from '../Drafts.module.css';

export interface DraftsGridProps {
  drafts: EditorQuiz[];
  isLoading?: boolean;
  isError?: boolean;
  isCreating?: boolean;
  canCreateMore: boolean;
  deletingId?: number | null;
  isDeleting?: boolean;
  sortBy?: DraftSortField;
  maxDrafts?: number;
  onRetry?: () => void;
  onCreateNew: () => void;
  onOpenDraft: (uuid: string) => void;
  onDeleteDraft: (e: React.MouseEvent, id: number) => void;
}

export function DraftsGrid({
  drafts,
  isLoading = false,
  isError = false,
  isCreating = false,
  canCreateMore,
  deletingId = null,
  isDeleting = false,
  sortBy = 'updatedAt',
  maxDrafts = 3,
  onRetry,
  onCreateNew,
  onOpenDraft,
  onDeleteDraft,
}: DraftsGridProps) {
  if (isLoading) {
    return (
      <div className={styles['drafts-loading-wrapper']}>
        <div className={styles['drafts-spinner']} />
        <p>Завантаження чернеток...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['drafts-error-card']}>
        <h3>Не вдалося завантажити чернетки</h3>
        <p>Перевірте інтернет-з'єднання та спробуйте ще раз.</p>
        {onRetry && (
          <button type="button" className={styles['btn-retry']} onClick={onRetry}>
            Спробувати знову
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles['drafts-grid']}>
      <DraftCreateCard
        canCreateMore={canCreateMore}
        isCreating={isCreating}
        maxDrafts={maxDrafts}
        onCreate={onCreateNew}
      />

      {drafts.map((draft, idx) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          index={idx}
          isDeleting={isDeleting && deletingId === draft.id}
          sortBy={sortBy}
          onOpen={onOpenDraft}
          onDelete={onDeleteDraft}
        />
      ))}
    </div>
  );
}
