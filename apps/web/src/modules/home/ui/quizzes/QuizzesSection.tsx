import { useLocale } from '../../../../shared/i18n/useLocale';
import { useGetPublishedQuizzesQuery } from '../../api/quizApi';
import type { PublicQuizSummary } from '../../models';
import { QuizCard } from './QuizCard';
import { QuizSkeletonCard } from './QuizSkeletonCard';

export interface QuizzesSectionProps {
  onSelectQuiz?: (quiz: PublicQuizSummary) => void;
}

const SAMPLE_QUIZ_KEYS = ['math', 'history', 'science', 'it', 'geo', 'english'] as const;

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
];

const SAMPLE_COUNTS = [10, 15, 12, 20, 14, 18];

export function QuizzesSection({ onSelectQuiz }: QuizzesSectionProps) {
  const { t, pluralize } = useLocale();

  const { data, isLoading } = useGetPublishedQuizzesQuery({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const realQuizzes = data?.quizzes ?? [];
  const hasRealQuizzes = realQuizzes.length > 0;

  return (
    <section className="quizzes-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('quizzes.title')}</h2>
          <p className="section-subtitle">{t('quizzes.subtitle')}</p>
        </div>

        {isLoading && !hasRealQuizzes && (
          <div className="quizzes-loading">
            <div className="quizzes-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <QuizSkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {hasRealQuizzes ? (
          <div className="quizzes-grid">
            {realQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onClick={onSelectQuiz} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="quizzes-grid">
              {SAMPLE_QUIZ_KEYS.map((key, index) => {
                const count = SAMPLE_COUNTS[index];
                return (
                  <div
                    key={key}
                    className="quiz-card card card--interactive"
                    onClick={() =>
                      onSelectQuiz?.({
                        id: index + 1,
                        uuid: `sample-${key}`,
                        name: t(`quizzes.samples.${key}.title`),
                        description: t(`quizzes.samples.${key}.description`),
                        coverImg: SAMPLE_COVERS[index],
                        isDraft: false,
                        authorId: index + 1,
                        author: {
                          id: index + 1,
                          uuid: `author-${key}`,
                          login: t(`quizzes.samples.${key}.author`),
                          firstName: null,
                          lastName: null,
                        },
                        keywords: [
                          { id: index + 1, quizId: index + 1, name: t(`quizzes.samples.${key}.category`) },
                        ],
                        _count: { questions: count },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      })
                    }
                  >
                    <div className="quiz-card__header">
                      <img
                        src={SAMPLE_COVERS[index]}
                        alt={t(`quizzes.samples.${key}.title`)}
                        className="quiz-card__cover-img"
                        loading="lazy"
                      />
                      <span className="quiz-card__category-badge">
                        {t(`quizzes.samples.${key}.category`)}
                      </span>
                    </div>
                    <div className="quiz-card__body">
                      <h3 className="quiz-card__title">
                        {t(`quizzes.samples.${key}.title`)}
                      </h3>
                      <p className="quiz-card__author">
                        {t('quizzes.author')}:{' '}
                        <span>{t(`quizzes.samples.${key}.author`)}</span>
                      </p>
                      <p className="quiz-card__desc">
                        {t(`quizzes.samples.${key}.description`)}
                      </p>
                      <div className="quiz-card__footer">
                        <span className="quiz-card__stat">
                          📝 {count}{' '}
                          {pluralize(count, {
                            uk: ['запитання', 'запитання', 'запитань'],
                            en: ['question', 'questions'],
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </section>
  );
}
