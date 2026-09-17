import { BinIcon, OneAnswerIcon, CalendarIcon, ClockIcon, ArrowRightIcon, pluralizeQuestions } from '../../../../shared';
import type { DraftCardProps } from './DraftCard.types';
import styles from '../Drafts.module.css';

export const DEFAULT_COVER_GRADIENT = 'linear-gradient(135deg, #863bff 0%, #3b82f6 100%)';

export function DraftCard({
  draft,
  index = 0,
  isDeleting = false,
  sortBy = 'updatedAt',
  onOpen,
  onDelete,
}: DraftCardProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(draft.uuid);
    }
  };

  return (
    <article
      className={`${styles['draft-card']} ${isDeleting ? styles['is-deleting'] : ''}`}
      onClick={() => onOpen(draft.uuid)}
      style={{ animationDelay: `${index * 80}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Cover */}
      <div
        className={styles['draft-card__cover']}
        style={{
          background: draft.coverImg
            ? `url(${draft.coverImg}) center/cover no-repeat`
            : DEFAULT_COVER_GRADIENT,
        }}
      >
        <span className={styles['draft-card__badge']}>Чернетка</span>

        <button
          type="button"
          className={styles['draft-card__delete-btn']}
          onClick={(e) => onDelete(e, draft.id)}
          title="Видалити чернетку"
          aria-label="Видалити чернетку"
        >
          <BinIcon width={14} height={14} />
        </button>
      </div>

      {/* Body */}
      <div className={styles['draft-card__body']}>
        <h3 className={styles['draft-card__title']}>{draft.name || 'Нова вікторина'}</h3>
        <p className={styles['draft-card__desc']}>
          {draft.description || 'Опис ще не додано...'}
        </p>

        <div className={styles['draft-card__meta']}>
          <span className={styles['meta-questions']}>
            <OneAnswerIcon size={15} />
            <span>{pluralizeQuestions(questionsCount, true)}</span>
          </span>
          <span className={styles['meta-date']} title={`Створено: ${createdFormatted}`}>
            {sortBy === 'createdAt' ? (
              <>
                <CalendarIcon size={14} />
                <span>{createdFormatted}</span>
              </>
            ) : (
              <>
                <ClockIcon size={14} />
                <span>{updatedFormatted}</span>
              </>
            )}
          </span>
        </div>

        <div className={styles['draft-card__footer']}>
          <button
            type="button"
            className={styles['draft-card__open-btn']}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(draft.uuid);
            }}
          >
            <span>Продовжити редагування</span>
            <span className={styles['open-arrow']}><ArrowRightIcon size={16} /></span>
          </button>
        </div>
      </div>
    </article>
  );
}
