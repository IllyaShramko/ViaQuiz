import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyDraftsQuery,
  useCreateQuizMutation,
  useDeleteQuizMutation,
  DraftsTopbar,
  DraftsHero,
  DraftsToolbar,
  DraftsGrid,
  type DraftSortField,
  type DraftSortOrder,
} from '../../../modules/quiz-editor';
import styles from '../../../modules/quiz-editor/ui/Drafts.module.css';

const MAX_DRAFTS = 3;

export function QuizDraftsPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<DraftSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<DraftSortOrder>('desc');

  const { data, isLoading, isError, refetch } = useGetMyDraftsQuery({ sortBy, sortOrder });
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const drafts = data?.quizzes || [];
  const draftsCount = drafts.length;
  const canCreateMore = draftsCount < MAX_DRAFTS;

  const handleCreateNew = async () => {
    if (!canCreateMore || isCreating) return;
    try {
      const newQuiz = await createQuiz({}).unwrap();
      navigate(`/quiz/${newQuiz.uuid}/edit`);
    } catch (err) {
      console.error('Failed to create new draft:', err);
    }
  };

  const handleOpenDraft = (uuid: string) => {
    navigate(`/quiz/${uuid}/edit`);
  };

  const handleDeleteDraft = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Ви впевнені, що хочете видалити цю чернетку?')) return;

    try {
      setDeletingId(id);
      await deleteQuiz(id).unwrap();
    } catch (err) {
      console.error('Failed to delete draft:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className={styles['quiz-drafts-page']}>
      <DraftsTopbar
        draftsCount={draftsCount}
        maxDrafts={MAX_DRAFTS}
        onBack={() => navigate('/dashboard')}
      />

      <main className={styles['drafts-main-content']}>
        <DraftsHero maxDrafts={MAX_DRAFTS} />

        <DraftsToolbar
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onToggleOrder={toggleSortOrder}
        />

        <DraftsGrid
          drafts={drafts}
          isLoading={isLoading}
          isError={isError}
          isCreating={isCreating}
          canCreateMore={canCreateMore}
          deletingId={deletingId}
          isDeleting={isDeleting}
          sortBy={sortBy}
          maxDrafts={MAX_DRAFTS}
          onRetry={refetch}
          onCreateNew={handleCreateNew}
          onOpenDraft={handleOpenDraft}
          onDeleteDraft={handleDeleteDraft}
        />
      </main>
    </div>
  );
}
