import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '../../../shared';
import {
  useGetMyDraftsQuery,
  useCreateQuizMutation,
  useDeleteQuizMutation,
  useLazyGetQuizForEditorQuery,
  DraftsTopbar,
  DraftsHero,
  DraftsToolbar,
  DraftsGrid,
  DeleteDraftModal,
  PublishModal,
  type DraftSortField,
  type DraftSortOrder,
  type EditorQuiz,
} from '../../../modules/quiz-editor';
import styles from './QuizDraftsPage.module.css';

const MAX_DRAFTS = 3;

export function QuizDraftsPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<DraftSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<DraftSortOrder>('desc');

  const { data, isLoading, isError, refetch } = useGetMyDraftsQuery(
    { sortBy, sortOrder },
    { refetchOnMountOrArgChange: true },
  );

  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();
  const [triggerGetQuiz] = useLazyGetQuizForEditorQuery();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<EditorQuiz | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [quizToPublish, setQuizToPublish] = useState<EditorQuiz | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const drafts = data?.quizzes || [];
  const draftsCount = drafts.length;
  const canCreateMore = draftsCount < MAX_DRAFTS;

  const handleCreateNew = async () => {
    if (!canCreateMore || isCreating) return;
    setActionError(null);
    try {
      const newQuiz = await createQuiz({}).unwrap();
      navigate(`/quiz/${newQuiz.uuid}/edit`);
    } catch (err) {
      console.error('Failed to create new draft:', err);
      setActionError('Не вдалося створити нову чернетку. Спробуйте ще раз.');
    }
  };

  const handleOpenDraft = (uuid: string) => {
    navigate(`/quiz/${uuid}/edit`);
  };

  const handleRequestDelete = (draft: EditorQuiz) => {
    setDeleteError(null);
    setDraftToDelete(draft);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (draft: EditorQuiz) => {
    setDeleteError(null);
    try {
      setDeletingId(draft.id);
      await deleteQuiz(draft.id).unwrap();
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      console.error('Failed to delete draft:', err);
      const apiErr = err as { data?: { message?: string } };
      setDeleteError(apiErr?.data?.message || 'Не вдалося видалити чернетку. Спробуйте пізніше.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRequestPublish = async (draft: EditorQuiz) => {
    setActionError(null);
    try {
      setPublishingId(draft.id);
      const fullQuiz = await triggerGetQuiz(draft.uuid).unwrap();
      setQuizToPublish(fullQuiz);
      setIsPublishModalOpen(true);
    } catch (err) {
      console.error('Failed to load draft for publishing:', err);
      setActionError('Не вдалося завантажити чернетку для публікації.');
    } finally {
      setPublishingId(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className={styles.page}>
      <DraftsTopbar
        draftsCount={draftsCount}
        maxDrafts={MAX_DRAFTS}
        onBack={() => navigate('/dashboard')}
      />

      <main className={styles.main}>
        <DraftsHero
          draftsCount={draftsCount}
          maxDrafts={MAX_DRAFTS}
          rightSlot={
            draftsCount > 0 ? (
              <div className={styles.headerActions}>
                <DraftsToolbar
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortByChange={setSortBy}
                  onToggleOrder={toggleSortOrder}
                />

                <button
                  type="button"
                  className={styles.createActionBtn}
                  onClick={handleCreateNew}
                  disabled={!canCreateMore || isCreating}
                  title={
                    !canCreateMore
                      ? `Досягнуто ліміту у ${MAX_DRAFTS} чернетки`
                      : 'Створити нову чернетку'
                  }
                >
                  <PlusIcon size={15} />
                  <span>{isCreating ? 'Створення...' : 'Створити квіз'}</span>
                </button>
              </div>
            ) : undefined
          }
        />

        {actionError && (
          <div className={styles.actionErrorBanner} role="alert">
            <span>{actionError}</span>
            <button
              type="button"
              className={styles.dismissErrorBtn}
              onClick={() => setActionError(null)}
            >
              Закрити
            </button>
          </div>
        )}

        <DraftsGrid
          drafts={drafts}
          isLoading={isLoading}
          isError={isError}
          isCreating={isCreating}
          canCreateMore={canCreateMore}
          deletingId={deletingId}
          isDeleting={isDeleting}
          publishingId={publishingId}
          sortBy={sortBy}
          maxDrafts={MAX_DRAFTS}
          onRetry={refetch}
          onCreateNew={handleCreateNew}
          onOpenDraft={handleOpenDraft}
          onDeleteDraft={handleRequestDelete}
          onPublishDraft={handleRequestPublish}
        />
      </main>

      <DeleteDraftModal
        draft={draftToDelete}
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        errorMessage={deleteError}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
          }
        }}
        onAfterClose={() => {
          setDraftToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {quizToPublish && (
        <PublishModal
          isOpen={isPublishModalOpen}
          quiz={quizToPublish}
          onClose={() => setIsPublishModalOpen(false)}
          onPublishSuccess={() => setIsPublishModalOpen(false)}
          onAfterClose={() => setQuizToPublish(null)}
        />
      )}
    </div>
  );
}
