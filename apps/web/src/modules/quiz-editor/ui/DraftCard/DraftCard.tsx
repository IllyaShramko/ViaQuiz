import { useEffect, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  BinIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  LogoIcon,
  OneAnswerIcon,
  PublicIcon,
  pluralizeQuestions,
} from '../../../../shared';
import { formatDraftFullDate, formatDraftRelativeTime } from '../../utils/formatDraftDate';
import type { DraftCardProps } from './DraftCard.types';
import styles from './DraftCard.module.css';

export function DraftCard({
  draft,
  index = 0,
  isDeleting = false,
  isPublishing = false,
  sortBy = 'updatedAt',
  onOpen,
  onDelete,
  onPublish,
}: DraftCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const questionsCount = draft._count?.questions ?? draft.questions?.length ?? 0;
  const hasQuestions = questionsCount > 0;
  const displayName = draft.name?.trim() || 'Новий квіз';
  const keywords = draft.keywords || [];
  const visibleKeywords = keywords.slice(0, 3);
  const remainingKeywordsCount = keywords.length - visibleKeywords.length;

  const dateSource = sortBy === 'createdAt' ? draft.createdAt : draft.updatedAt;
  const relativeDateLabel = formatDraftRelativeTime(dateSource);
  const fullDateTooltip =
    sortBy === 'createdAt'
      ? `Створено: ${formatDraftFullDate(draft.createdAt)}`
      : `Оновлено: ${formatDraftFullDate(draft.updatedAt)}`;

  // Close overflow popover on outside click or Escape key
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(draft.uuid);
    }
  };

  return (
    <article
      className={`${styles.card} ${isMenuOpen ? styles.menuOpen : ''} ${isDeleting ? styles.isDeleting : ''}`}
      onClick={() => onOpen(draft.uuid)}
      style={{ animationDelay: `${index * 45}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
    >
      {/* Cover */}
      <div className={styles.coverSection}>
        <div className={styles.coverMedia}>
          {draft.coverImg ? (
            <>
              <img
                src={draft.coverImg}
                alt={displayName}
                className={styles.coverImage}
              />
              <div className={styles.coverScrim} />
            </>
          ) : (
            <LogoIcon size={32} className={styles.coverFallbackMark} />
          )}
        </div>

        <div className={styles.coverOverlay}>
          <span
            className={`${styles.statusBadge} ${hasQuestions ? styles.statusBadgeReady : ''}`}
          >
            <span
              className={`${styles.statusDot} ${hasQuestions ? styles.statusDotReady : ''}`}
              aria-hidden="true"
            />
            <span>{hasQuestions ? 'У роботі' : 'Порожній'}</span>
          </span>

          <div
            className={styles.menuContainer}
            ref={menuContainerRef}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.menuTrigger}
              aria-label={`Дії для чернетки ${displayName}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="5" cy="12" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="19" cy="12" r="1.75" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className={styles.menuPopover} role="menu">
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpen(draft.uuid);
                  }}
                >
                  <EditIcon size={14} aria-hidden="true" />
                  <span>Редагувати</span>
                </button>

                {onPublish && (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    disabled={!hasQuestions || isPublishing}
                    title={
                      !hasQuestions
                        ? 'Додайте щонайменше 1 запитання у редакторі'
                        : 'Перевірити та опублікувати вікторину'
                    }
                    onClick={() => {
                      setIsMenuOpen(false);
                      onPublish(draft);
                    }}
                  >
                    <PublicIcon size={13} />
                    <span>{isPublishing ? 'Завантаження...' : 'Опублікувати'}</span>
                  </button>
                )}

                <div className={styles.menuDivider} />

                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(draft);
                  }}
                >
                  <BinIcon size={13} />
                  <span>Видалити</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{displayName}</h3>
          <ArrowRightIcon size={15} className={styles.titleArrow} />
        </div>

        {draft.description?.trim() ? (
          <p className={styles.desc}>{draft.description}</p>
        ) : (
          <p className={styles.descEmpty}>Без опису</p>
        )}

        {visibleKeywords.length > 0 && (
          <div className={styles.tagsRow}>
            {visibleKeywords.map((keyword) => (
              <span key={keyword.id} className={styles.tagPill}>
                #{keyword.name}
              </span>
            ))}
            {remainingKeywordsCount > 0 && (
              <span className={styles.tagMore}>+{remainingKeywordsCount}</span>
            )}
          </div>
        )}

        <div className={styles.meta}>
          <span
            className={`${styles.metaItem} ${!hasQuestions ? styles.metaZero : styles.metaCount}`}
          >
            <OneAnswerIcon size={14} />
            <span>{pluralizeQuestions(questionsCount, true)}</span>
          </span>

          <span className={`${styles.metaItem} ${styles.metaDate}`} title={fullDateTooltip}>
            {sortBy === 'createdAt' ? (
              <CalendarIcon size={13} />
            ) : (
              <ClockIcon size={13} />
            )}
            <span>{relativeDateLabel}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
