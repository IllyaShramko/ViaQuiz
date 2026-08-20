import React from 'react';
import type { QuizDetail, PublicQuizSummary } from '../../models';
import styles from '../Library.module.css';

export const LIBRARY_GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
];

export interface LibraryQuizCardProps {
  quiz: QuizDetail | PublicQuizSummary;
  isLikedTab?: boolean;
  index?: number;
  onClick: (uuid: string) => void;
  onEdit?: (uuid: string) => void;
  onDelete?: (e: React.MouseEvent, id: number) => void;
  onUnlike?: (e: React.MouseEvent, uuid: string) => void;
}

export function LibraryQuizCard({
  quiz,
  isLikedTab = false,
  index = 0,
  onClick,
  onEdit,
  onDelete,
  onUnlike,
}: LibraryQuizCardProps) {
  const gradient = LIBRARY_GRADIENTS[index % LIBRARY_GRADIENTS.length];
  const questionsCount = quiz._count?.questions || 0;
  const viewsCount = quiz._count?.views || 0;
  const likesCount = quiz._count?.likes || 0;

  const author = 'author' in quiz ? quiz.author : undefined;
  const authorName =
    author?.firstName && author?.lastName
      ? `${author.firstName} ${author.lastName}`
      : author?.firstName || author?.login || null;

  return (
    <article
      className={styles['library-card']}
      onClick={() => onClick(quiz.uuid)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(quiz.uuid);
        }
      }}
    >
      {/* Cover Header */}
      <div className={styles['library-card__header']}>
        {quiz.coverImg ? (
          <img
            src={quiz.coverImg}
            alt={quiz.name}
            className={styles['library-card__cover-img']}
          />
        ) : (
          <div
            className={styles['library-card__cover-fallback']}
            style={{ background: gradient }}
          >
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={styles['library-card__logo-icon']}>
              <g transform="translate(-164, -2239)">
                <path
                  fill="currentColor"
                  d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946"
                />
              </g>
            </svg>
          </div>
        )}

        {/* Top Badges */}
        <div className={styles['library-card__badge-top']}>
          {!isLikedTab && (
            <span
              className={`${styles['library-card__status']} ${
                quiz.isDraft ? styles['is-draft'] : styles['is-published']
              }`}
            >
              {quiz.isDraft ? 'Чернетка' : 'Опубліковано'}
            </span>
          )}
        </div>

        {/* Unlike Action on Liked Tab */}
        {isLikedTab && onUnlike && (
          <button
            type="button"
            className={styles['library-card__like-action']}
            onClick={(e) => {
              e.stopPropagation();
              onUnlike(e, quiz.uuid);
            }}
            title="Прибрати з вподобаних"
            aria-label="Прибрати з вподобаних"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className={styles['library-card__body']}>
        <h3 className={styles['library-card__title']}>{quiz.name}</h3>

        {authorName && (
          <p className={styles['library-card__author']}>
            Автор: <span>{authorName}</span>
          </p>
        )}

        <p className={styles['library-card__desc']}>
          {quiz.description || 'Опис для цієї вікторини не вказано.'}
        </p>

        {/* Footer */}
        <div className={styles['library-card__footer']}>
          <div className={styles['library-card__stats']}>
            <span className={styles['library-card__stat']}>
              📝 {questionsCount}
            </span>
            <span className={styles['library-card__stat']}>
              👁️ {viewsCount}
            </span>
            {likesCount > 0 && (
              <span className={styles['library-card__stat']}>
                ❤️ {likesCount}
              </span>
            )}
          </div>

          <div className={styles['library-card__actions']}>
            {/* Edit Draft / Quiz */}
            {!isLikedTab && onEdit && (
              <button
                type="button"
                className={styles['library-card__btn-icon']}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(quiz.uuid);
                }}
                title="Редагувати"
                aria-label="Редагувати"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}

            {/* Delete Quiz */}
            {!isLikedTab && onDelete && (
              <button
                type="button"
                className={`${styles['library-card__btn-icon']} ${styles['is-danger']}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e, quiz.id);
                }}
                title="Видалити"
                aria-label="Видалити"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
