import { useLocale } from '../../../../shared/i18n/useLocale';
import { useGetPublishedQuizzesQuery } from '../../api/quizApi';
import type { PublicQuizSummary } from '../../models';
import { QuizCard } from './QuizCard';
import { QuizSkeletonCard } from './QuizSkeletonCard';

export interface QuizzesSectionProps {
  onSelectQuiz?: (quiz: PublicQuizSummary) => void;
}

export function QuizzesSection({ onSelectQuiz }: QuizzesSectionProps) {
  const { t, locale } = useLocale();

  const { data, isLoading, error } = useGetPublishedQuizzesQuery({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const quizzes = data?.quizzes ?? [];

  return (
    <section className="quizzes-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('quizzes.title')}</h2>
          <p className="section-subtitle">{t('quizzes.subtitle')}</p>
        </div>

        {isLoading && (
          <div className="quizzes-loading">
            <div className="quizzes-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <QuizSkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="quizzes-error">
            <p>
              {locale === 'uk'
                ? 'Не вдалося завантажити вікторини'
                : 'Failed to load quizzes'}
            </p>
          </div>
        )}

        {!isLoading && !error && quizzes.length === 0 && (
          <div className="quizzes-empty">
            <p>
              {locale === 'uk'
                ? 'Поки що немає опублікованих вікторин'
                : 'No published quizzes yet'}
            </p>
          </div>
        )}

        {!isLoading && !error && quizzes.length > 0 && (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onClick={onSelectQuiz} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
