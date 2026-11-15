import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  LogoIcon,
  PlusIcon,
  pluralizeQuestions,
  ViewEyeIcon,
} from '../../../../shared';
import type { ProfileQuizzesSectionProps } from './ProfileQuizzesSection.types';
import styles from './ProfileQuizzesSection.module.css';

function formatShortDate(rawDate: string): string {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  });
}

export function ProfileQuizzesSection({
  quizzes,
  total,
  isLoading = false,
  isError = false,
}: ProfileQuizzesSectionProps) {
  const displayTotal = total ?? quizzes.length;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headingRow}>
          <h3 className={styles.title}>Опубліковані вікторини</h3>
          <span className={styles.countBadge}>{displayTotal}</span>
        </div>

        <Link to="/library" className={styles.allLink}>
          <span>Уся бібліотека</span>
          <ArrowRightIcon size={13} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className={styles.grid} aria-label="Завантаження вікторин">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className={styles.skeletonCard} />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.errorBanner} role="alert">
          Не вдалося завантажити опубліковані вікторини.
        </div>
      ) : quizzes.length === 0 ? (
        <div className={styles.emptyCard}>
          <h4 className={styles.emptyTitle}>Опублікованих вікторин ще немає</h4>
          <p className={styles.emptyText}>
            Створіть або опублікуйте вікторину у бібліотеці, щоб вона відображалася у вашому профілі.
          </p>
          <Link to="/quiz/drafts" className={styles.emptyAction}>
            <PlusIcon size={15} aria-hidden="true" />
            <span>Створити вікторину</span>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {quizzes.map((quiz) => {
            const questionsCount = quiz._count?.questions ?? 0;
            const viewsCount = quiz._count?.views ?? 0;
            const keyword = quiz.keywords?.[0]?.name;
            const updatedDate = formatShortDate(quiz.updatedAt);

            return (
              <Link
                key={quiz.uuid}
                to={`/quiz/${quiz.uuid}`}
                className={styles.quizCard}
              >
                <div className={styles.coverWrap}>
                  {quiz.coverImg ? (
                    <img
                      src={quiz.coverImg}
                      alt=""
                      className={styles.coverImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.coverFallback} aria-hidden="true">
                      <span className={styles.coverFallbackMark}>
                        <LogoIcon size={30} />
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h4 className={styles.quizTitle}>{quiz.name}</h4>
                      <ArrowRightIcon
                        size={15}
                        className={styles.quizArrow}
                        aria-hidden="true"
                      />
                    </div>

                    {quiz.description?.trim() ? (
                      <p className={styles.quizDesc}>{quiz.description}</p>
                    ) : (
                      <p className={styles.quizDescMuted}>Опис не додано</p>
                    )}
                  </div>

                  <div className={styles.cardMeta}>
                    {keyword && <span className={styles.keywordTag}>{keyword}</span>}

                    <span className={styles.metaItem}>
                      {questionsCount} {pluralizeQuestions(questionsCount)}
                    </span>

                    <span className={styles.metaDot} aria-hidden="true">
                      ·
                    </span>

                    <span className={styles.metaItem} title="Перегляди">
                      <ViewEyeIcon size={13} aria-hidden="true" />
                      <span>{viewsCount}</span>
                    </span>

                    {updatedDate && (
                      <span className={styles.metaDate}>{updatedDate}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
