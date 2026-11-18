import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  CopyIcon,
  EditIcon,
  ExpandIcon,
  LogoIcon,
  copyToClipboard,
  getUserDisplayName,
  getUserInitials,
} from '../../../../shared';
import { useToggleLikeMutation } from '../../api';
import { formatQuizDate, formatQuizDuration } from '../../utils';
import type { QuizDetailsHeroProps } from './QuizDetailsHero.types';
import styles from './QuizDetailsHero.module.css';

export const DEFAULT_QUIZ_HERO_GRADIENT = 'var(--color-bg-surface, #1a1a26)';

export function QuizDetailsHero({
  quiz,
  isOwner = false,
  onPreviewImage,
}: QuizDetailsHeroProps) {
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState<number | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const isLiked = optimisticLiked !== null ? optimisticLiked : Boolean(quiz.isLiked);
  const initialLikes = quiz._count?.likes ?? 0;
  const likesCount = optimisticLikesCount !== null ? optimisticLikesCount : initialLikes;

  const authorName = getUserDisplayName(quiz.author, 'Користувач');
  const authorInitials = getUserInitials(quiz.author);

  const questions = quiz.questions || [];
  const questionsCount = questions.length || quiz._count?.questions || 0;
  const viewsCount = quiz._count?.views ?? 0;
  const durationLabel = formatQuizDuration(questions);
  const createdDate = formatQuizDate(quiz.createdAt);
  const updatedDate = formatQuizDate(quiz.updatedAt);
  const keywords = quiz.keywords || [];

  const handleToggleLike = async () => {
    if (isLiking) return;
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setOptimisticLiked(nextLiked);
    setOptimisticLikesCount(nextCount);

    try {
      const res = await toggleLike(quiz.uuid).unwrap();
      setOptimisticLiked(res.isLiked);
      setOptimisticLikesCount(res.likesCount);
    } catch {
      setOptimisticLiked(null);
      setOptimisticLikesCount(null);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/quiz/${quiz.uuid}`;
    const copied = await copyToClipboard(shareUrl);
    if (!copied) return;

    setIsLinkCopied(true);
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setIsLinkCopied(false);
    }, 1500);
  };

  return (
    <section className={styles.heroCard} aria-label="Деталі вікторини">
      <div className={styles.topSection}>
        <div className={styles.coverWrapper}>
          {quiz.coverImg ? (
            onPreviewImage ? (
              <button
                type="button"
                className={styles.coverButton}
                onClick={() => onPreviewImage({ src: quiz.coverImg!, alt: quiz.name })}
                aria-label="Збільшити обкладинку вікторини"
              >
                <img src={quiz.coverImg} alt={quiz.name} className={styles.coverImg} />
                <span className={styles.coverZoomBadge} aria-hidden="true">
                  <ExpandIcon size={13} />
                </span>
              </button>
            ) : (
              <img src={quiz.coverImg} alt={quiz.name} className={styles.coverImg} />
            )
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              <LogoIcon size={34} />
            </div>
          )}
        </div>

        <div className={styles.infoColumn}>
          <div className={styles.headerRow}>
            <div className={styles.titleGroup}>
              <h2 className={styles.title}>{quiz.name}</h2>
              {quiz.isDraft && <span className={styles.draftPill}>Чернетка</span>}
            </div>

            <div className={styles.actionsGroup}>
              {isOwner && (
                <Link to={`/quiz/${quiz.uuid}/edit`} className={styles.actionBtn}>
                  <EditIcon size={14} aria-hidden="true" />
                  <span>Редагувати</span>
                </Link>
              )}

              <button
                type="button"
                className={`${styles.actionBtn} ${isLinkCopied ? styles.isCopied : ''}`}
                onClick={handleCopyLink}
                aria-label="Скопіювати посилання на вікторину"
              >
                {isLinkCopied ? (
                  <>
                    <CheckIcon size={14} className={styles.copiedIcon} aria-hidden="true" />
                    <span>Скопійовано</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} aria-hidden="true" />
                    <span>Посилання</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={`${styles.actionBtn} ${styles.likeBtn} ${isLiked ? styles.isLiked : ''}`}
                onClick={handleToggleLike}
                disabled={isLiking}
                aria-pressed={isLiked}
                aria-label={isLiked ? 'Видалити з вподобаних' : 'Додати у вподобані'}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className={styles.likeCount}>{likesCount}</span>
              </button>
            </div>
          </div>

          <p
            className={`${styles.description} ${
              !quiz.description ? styles.descriptionMuted : ''
            }`}
          >
            {quiz.description || 'Опис для цієї вікторини не вказано.'}
          </p>

          {keywords.length > 0 && (
            <ul className={styles.keywordsList} aria-label="Ключові слова">
              {keywords.map((keyword) => (
                <li key={keyword.id} className={styles.keywordTag}>
                  #{keyword.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.metaBar}>
        <div className={styles.metaPrimaryGroup}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Автор</span>
            {quiz.author?.uuid ? (
              <Link to={`/users/${quiz.author.uuid}`} className={styles.authorLink}>
                <span className={styles.authorChip} aria-hidden="true">
                  {authorInitials}
                </span>
                <span>{authorName}</span>
              </Link>
            ) : (
              <span className={styles.metaValue}>
                <span className={styles.authorChip} aria-hidden="true">
                  {authorInitials}
                </span>
                <span>{authorName}</span>
              </span>
            )}
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Запитань</span>
            <span
              className={`${styles.metaValue} ${
                questionsCount === 0 ? styles.metaValueMuted : ''
              }`}
            >
              {questionsCount}
            </span>
          </div>

          {durationLabel && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Орієнтовний час</span>
              <span className={styles.metaValue}>{durationLabel}</span>
            </div>
          )}

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Переглядів</span>
            <span
              className={`${styles.metaValue} ${
                viewsCount === 0 ? styles.metaValueMuted : ''
              }`}
            >
              {viewsCount}
            </span>
          </div>
        </div>

        {(createdDate || updatedDate) && (
          <div className={styles.metaDatesGroup}>
            {createdDate && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Створено</span>
                <time
                  className={styles.metaValue}
                  dateTime={quiz.createdAt}
                  title={createdDate.full}
                >
                  {createdDate.short}
                </time>
              </div>
            )}

            {updatedDate && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Оновлено</span>
                <time
                  className={styles.metaValue}
                  dateTime={quiz.updatedAt}
                  title={updatedDate.full}
                >
                  {updatedDate.short}
                </time>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
