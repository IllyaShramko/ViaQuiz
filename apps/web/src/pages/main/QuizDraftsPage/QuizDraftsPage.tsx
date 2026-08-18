import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyDraftsQuery,
  useCreateQuizMutation,
  useDeleteQuizMutation,
} from '../../../modules/quiz-editor';
import { ArrowIcon, PlusIcon, BinIcon } from '../../../shared';
import './QuizDraftsPage.css';

const DEFAULT_COVER_GRADIENT = 'linear-gradient(135deg, #863bff 0%, #3b82f6 100%)';
const MAX_DRAFTS = 3;

type SortField = 'updatedAt' | 'createdAt';
type SortOrder = 'desc' | 'asc';

export function QuizDraftsPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
    <div className="quiz-drafts-page">
      {/* Top Navigation Bar */}
      <header className="drafts-topbar">
        <div className="drafts-topbar__left">
          <button
            type="button"
            className="drafts-back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowIcon width={16} height={16} />
            <span>До панелі вчителя</span>
          </button>
        </div>

        <div className="drafts-topbar__center">
          <h1 className="drafts-topbar__title">Конструктор вікторин</h1>
        </div>

        <div className="drafts-topbar__right">
          <div className={`drafts-counter-pill ${draftsCount >= MAX_DRAFTS ? 'is-full' : ''}`}>
            <span className="counter-dot" />
            <span>Чернетки: <strong>{draftsCount}</strong> / {MAX_DRAFTS}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="drafts-main-content">
        <div className="drafts-hero">
          <h2 className="drafts-hero__title">Ваші чернетки вікторин</h2>
          <p className="drafts-hero__subtitle">
            Оберіть існуючу чернетку для продовження редагування або створіть нову (максимум {MAX_DRAFTS})
          </p>
        </div>

        {/* Toolbar: Sorting Controls */}
        <div className="drafts-toolbar">
          <div className="drafts-sort-group">
            <span className="sort-label">Сортування:</span>
            
            <div className="sort-buttons">
              <button
                type="button"
                className={`sort-btn ${sortBy === 'updatedAt' ? 'is-active' : ''}`}
                onClick={() => setSortBy('updatedAt')}
              >
                🕒 За датою оновлення
              </button>
              
              <button
                type="button"
                className={`sort-btn ${sortBy === 'createdAt' ? 'is-active' : ''}`}
                onClick={() => setSortBy('createdAt')}
              >
                📅 За датою створення
              </button>
            </div>

            <button
              type="button"
              className="sort-direction-btn"
              onClick={toggleSortOrder}
              title={sortOrder === 'desc' ? 'Спочатку новіші' : 'Спочатку старіші'}
            >
              <span>{sortOrder === 'desc' ? '↓ Новіші спочатку' : '↑ Старіші спочатку'}</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="drafts-loading-wrapper">
            <div className="drafts-spinner" />
            <p>Завантаження чернеток...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="drafts-error-card">
            <h3>Не вдалося завантажити чернетки</h3>
            <p>Перевірте інтернет-з'єднання та спробуйте ще раз.</p>
            <button type="button" className="btn-retry" onClick={() => refetch()}>
              Спробувати знову
            </button>
          </div>
        )}

        {/* Drafts Grid */}
        {!isLoading && !isError && (
          <div className="drafts-grid">
            {/* Create New Draft Card */}
            {canCreateMore ? (
              <div
                className={`draft-create-card ${isCreating ? 'is-loading' : ''}`}
                onClick={handleCreateNew}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCreateNew();
                  }
                }}
              >
                <div className="draft-create-card__inner">
                  {isCreating ? (
                    <>
                      <div className="drafts-spinner" />
                      <span className="create-text-main">Створення...</span>
                    </>
                  ) : (
                    <>
                      <div className="create-icon-bubble">
                        <PlusIcon width={32} height={32} />
                      </div>
                      <span className="create-text-main">+ Створити новий квіз</span>
                      <span className="create-text-sub">Почати з чистого аркуша</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="draft-limit-card">
                <div className="draft-limit-card__inner">
                  <span className="limit-icon">⚠️</span>
                  <span className="limit-title">Ліміт вичерпано</span>
                  <span className="limit-desc">
                    У вас уже створено 3 чернетки. Опублікуйте або видаліть одну з них для створення нової.
                  </span>
                </div>
              </div>
            )}

            {/* List of existing drafts */}
            {drafts.map((draft, idx) => {
              const questionsCount = draft._count?.questions ?? draft.questions?.length ?? 0;
              
              const updatedFormatted = draft.updatedAt
                ? new Date(draft.updatedAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Нещодавно';

              const createdFormatted = draft.createdAt
                ? new Date(draft.createdAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Нещодавно';

              const isCurrentDeleting = isDeleting && deletingId === draft.id;

              return (
                <article
                  key={draft.id}
                  className={`draft-card ${isCurrentDeleting ? 'is-deleting' : ''}`}
                  onClick={() => handleOpenDraft(draft.uuid)}
                  style={{ animationDelay: `${idx * 80}ms` }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenDraft(draft.uuid);
                    }
                  }}
                >
                  {/* Cover */}
                  <div
                    className="draft-card__cover"
                    style={{
                      background: draft.coverImg
                        ? `url(${draft.coverImg}) center/cover no-repeat`
                        : DEFAULT_COVER_GRADIENT,
                    }}
                  >
                    <span className="draft-card__badge">Чернетка</span>
                    
                    <button
                      type="button"
                      className="draft-card__delete-btn"
                      onClick={(e) => handleDeleteDraft(e, draft.id)}
                      title="Видалити чернетку"
                      aria-label="Видалити чернетку"
                    >
                      <BinIcon width={14} height={14} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="draft-card__body">
                    <h3 className="draft-card__title">{draft.name || 'Нова вікторина'}</h3>
                    <p className="draft-card__desc">
                      {draft.description || 'Опис ще не додано...'}
                    </p>

                    <div className="draft-card__meta">
                      <span className="meta-questions">
                        📝 {questionsCount} {questionsCount === 1 ? 'питання' : questionsCount >= 2 && questionsCount <= 4 ? 'питання' : 'питань'}
                      </span>
                      <span className="meta-date" title={`Створено: ${createdFormatted}`}>
                        {sortBy === 'createdAt' ? `📅 ${createdFormatted}` : `🕒 ${updatedFormatted}`}
                      </span>
                    </div>

                    <div className="draft-card__footer">
                      <button
                        type="button"
                        className="draft-card__open-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDraft(draft.uuid);
                        }}
                      >
                        <span>Продовжити редагування</span>
                        <span className="open-arrow">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
