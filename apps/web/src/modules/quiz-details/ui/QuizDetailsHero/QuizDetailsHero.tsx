import { useState } from 'react';
import type { QuizDetailsHeroProps } from './QuizDetailsHero.types';
import { useToggleLikeMutation } from '../../api';
import styles from '../QuizDetails.module.css';

export const DEFAULT_QUIZ_HERO_GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';

export function QuizDetailsHero({ quiz }: QuizDetailsHeroProps) {
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState<number | null>(null);

  const isLiked = optimisticLiked !== null ? optimisticLiked : !!quiz.isLiked;
  const initialLikes = quiz._count?.likes ?? 0;
  const likesCount = optimisticLikesCount !== null ? optimisticLikesCount : initialLikes;

  const authorName =
    quiz.author?.firstName && quiz.author?.lastName
      ? `${quiz.author.firstName} ${quiz.author.lastName}`
      : quiz.author?.firstName || quiz.author?.login || 'Користувач';

  const questions = quiz.questions || [];
  const questionsCount = questions.length || quiz._count?.questions || 0;
  const viewsCount = quiz._count?.views || 0;
  const formattedDate = quiz.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

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

  return (
    <section className={styles['quiz-hero-card']}>
      {/* Cover Preview */}
      <div className={styles['quiz-hero-cover-wrapper']}>
        {quiz.coverImg ? (
          <img
            src={quiz.coverImg}
            alt={quiz.name}
            className={styles['quiz-hero-cover-img']}
          />
        ) : (
          <div className={styles['quiz-hero-cover-fallback']} style={{ background: DEFAULT_QUIZ_HERO_GRADIENT }}>
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={styles['quiz-hero-logo']}>
              <g transform="translate(-164, -2239)">
                <path
                  fill="currentColor"
                  d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946"
                />
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* Info & Meta */}
      <div className={styles['quiz-hero-info']}>
        <div className={styles['quiz-hero-badge-row']}>
          <span className={`${styles['quiz-status-pill']} ${quiz.isDraft ? styles['is-draft'] : styles['is-published']}`}>
            {quiz.isDraft ? 'Чернетка' : 'Опубліковано'}
          </span>

          <button
            type="button"
            className={`${styles['quiz-hero-like-btn']} ${isLiked ? styles['is-liked'] : ''}`}
            onClick={handleToggleLike}
            title={isLiked ? 'Видалити з вподобаних' : 'Додати у вподобані'}
            aria-label={isLiked ? 'Видалити з вподобаних' : 'Додати у вподобані'}
          >
            <svg
              className={styles['quiz-hero-like-icon']}
              viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{likesCount}</span>
          </button>
        </div>

        <h2 className={styles['quiz-hero-title']}>{quiz.name}</h2>

        <p className={styles['quiz-hero-desc']}>
          {quiz.description || 'Опис для цієї вікторини не вказано.'}
        </p>

        <div className={styles['quiz-hero-meta-list']}>
          <div className={styles['quiz-hero-meta-item']}>
            <span className={styles['quiz-hero-meta-label']}>Автор</span>
            <span className={styles['quiz-hero-meta-val']}>{authorName}</span>
          </div>

          <div className={styles['quiz-hero-meta-item']}>
            <span className={styles['quiz-hero-meta-label']}>Запитань</span>
            <span className={styles['quiz-hero-meta-val']}>{questionsCount}</span>
          </div>

          <div className={styles['quiz-hero-meta-item']}>
            <span className={styles['quiz-hero-meta-label']}>Переглядів</span>
            <span className={styles['quiz-hero-meta-val']}>{viewsCount}</span>
          </div>

          {formattedDate && (
            <div className={styles['quiz-hero-meta-item']}>
              <span className={styles['quiz-hero-meta-label']}>Створено</span>
              <span className={styles['quiz-hero-meta-val']}>{formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
