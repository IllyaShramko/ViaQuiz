import { useLocale } from '../../../../shared/i18n/useLocale';
import type { PublicQuizSummary } from '../../models';

const DEFAULT_QUIZ_COVER =
  'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains';

export interface QuizCardProps {
  quiz: PublicQuizSummary;
  onClick?: (quiz: PublicQuizSummary) => void;
}

export function QuizCard({ quiz, onClick }: QuizCardProps) {
  const { t, pluralize } = useLocale();

  const getAuthorName = (author: {
    login: string;
    firstName: string | null;
    lastName: string | null;
  }) => {
    if (author.firstName || author.lastName) {
      return [author.firstName, author.lastName].filter(Boolean).join(' ');
    }
    return author.login;
  };

  const questionCount = quiz._count?.questions ?? 0;

  return (
    <div
      className="quiz-card card card--interactive"
      onClick={() => onClick?.(quiz)}
    >
      <div className="quiz-card__header">
        <img
          src={quiz.coverImg || DEFAULT_QUIZ_COVER}
          alt={quiz.name}
          className="quiz-card__cover-img"
          loading="lazy"
        />
        {quiz.keywords.length > 0 && (
          <span className="quiz-card__category-badge">
            {quiz.keywords[0].name}
          </span>
        )}
      </div>
      <div className="quiz-card__body">
        <h3 className="quiz-card__title">{quiz.name}</h3>
        <p className="quiz-card__author">
          {t('quizzes.author')}: <span>{getAuthorName(quiz.author)}</span>
        </p>
        {quiz.description && (
          <p className="quiz-card__desc">{quiz.description}</p>
        )}
        <div className="quiz-card__footer">
          <span className="quiz-card__stat">
            📝 {questionCount}{' '}
            {pluralize(questionCount, {
              uk: ['запитання', 'запитання', 'запитань'],
              en: ['question', 'questions'],
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
