import { useLocale } from '../../../../shared/i18n/useLocale';
import { useGetPublishedQuizzesQuery } from '../../api/quizApi';
import type { PublicQuizSummary } from '../../models';
import { QuizCard } from './QuizCard';
import { QuizSkeletonCard } from './QuizSkeletonCard';
import styles from '../Home.module.css';

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
  const { t } = useLocale();

  const { data, isLoading } = useGetPublishedQuizzesQuery({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const realQuizzes = data?.quizzes ?? [];
  const hasRealQuizzes = realQuizzes.length > 0;

  return (
    <section className={styles['quizzes-section']}>
      <div className="container">
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>{t('quizzes.title')}</h2>
          <p className={styles['section-subtitle']}>{t('quizzes.subtitle')}</p>
        </div>

        {isLoading && !hasRealQuizzes && (
          <div className={styles['quizzes-loading']}>
            <div className={styles['quizzes-grid']}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <QuizSkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {hasRealQuizzes ? (
          <div className={styles['quizzes-grid']}>
            {realQuizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                index={index}
                onClick={onSelectQuiz}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className={styles['quizzes-grid']}>
              {SAMPLE_QUIZ_KEYS.map((key, index) => {
                const count = SAMPLE_COUNTS[index];
                const sampleQuiz: PublicQuizSummary = {
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
                };

                return (
                  <QuizCard
                    key={key}
                    quiz={sampleQuiz}
                    index={index}
                    onClick={onSelectQuiz}
                  />
                );
              })}
            </div>
          )
        )}
      </div>
    </section>
  );
}
