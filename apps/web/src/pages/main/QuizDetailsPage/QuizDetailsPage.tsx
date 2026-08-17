import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetQuizByUuidQuery,
  type QuizQuestion,
  type QuestionVariant,
} from '../../../modules/home';
import './QuizDetailsPage.css';

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';

export function QuizDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const {
    data: quiz,
    isLoading,
    isError,
    refetch,
  } = useGetQuizByUuidQuery(uuid || '', {
    skip: !uuid,
  });

  if (isLoading) {
    return (
      <div className="quiz-details-page">
        <div className="quiz-details-skeleton">
          <div className="quiz-details-skeleton__hero">
            <div className="quiz-details-skeleton__thumb" />
            <div className="quiz-details-skeleton__content">
              <div className="quiz-details-skeleton__line title" />
              <div className="quiz-details-skeleton__line desc" />
              <div className="quiz-details-skeleton__line meta" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="quiz-details-page">
        <div className="quiz-details-error">
          <h3>Вікторину не знайдено</h3>
          <p>Можливо, вона була видалена або у вас немає прав на її перегляд.</p>
          <div className="quiz-details-error__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/dashboard')}
            >
              Повернутися на головну
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => refetch()}
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  const authorName =
    quiz.author?.firstName && quiz.author?.lastName
      ? `${quiz.author.firstName} ${quiz.author.lastName}`
      : quiz.author?.firstName || quiz.author?.login || 'Користувач';

  const questions = quiz.questions || [];
  const questionsCount = questions.length || quiz._count?.questions || 0;
  const formattedDate = quiz.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="quiz-details-page">
      {/* Back button */}
      <button
        type="button"
        className="quiz-details-back-btn"
        onClick={() => navigate('/dashboard')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Назад до списку вікторин</span>
      </button>

      {/* Two-Column Hero Card */}
      <section className="quiz-hero-card">
        {/* Cover Preview (Fixed 16:9 ratio, no awkward stretch) */}
        <div className="quiz-hero-cover-wrapper">
          {quiz.coverImg ? (
            <img
              src={quiz.coverImg}
              alt={quiz.name}
              className="quiz-hero-cover-img"
            />
          ) : (
            <div className="quiz-hero-cover-fallback" style={{ background: DEFAULT_GRADIENT }}>
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="quiz-hero-logo">
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
        <div className="quiz-hero-info">
          <div className="quiz-hero-badge-row">
            <span className={`quiz-status-pill ${quiz.isDraft ? 'is-draft' : 'is-published'}`}>
              {quiz.isDraft ? 'Чернетка' : 'Опубліковано'}
            </span>
          </div>

          <h2 className="quiz-hero-title">{quiz.name}</h2>
          
          <p className="quiz-hero-desc">
            {quiz.description || 'Опис для цієї вікторини не вказано.'}
          </p>

          <div className="quiz-hero-meta-list">
            <div className="quiz-hero-meta-item">
              <span className="quiz-hero-meta-label">Автор</span>
              <span className="quiz-hero-meta-val">{authorName}</span>
            </div>

            <div className="quiz-hero-meta-item">
              <span className="quiz-hero-meta-label">Запитань</span>
              <span className="quiz-hero-meta-val">{questionsCount}</span>
            </div>

            {formattedDate && (
              <div className="quiz-hero-meta-item">
                <span className="quiz-hero-meta-label">Створено</span>
                <span className="quiz-hero-meta-val">{formattedDate}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="quiz-questions-section">
        <div className="quiz-questions-section__header">
          <h3 className="quiz-questions-section__title">
            Запитання ({questions.length})
          </h3>
        </div>

        {questions.length === 0 ? (
          <div className="quiz-questions-empty">
            <p>У цій вікторині ще немає запитань.</p>
          </div>
        ) : (
          <div className="quiz-questions-list">
            {questions.map((question: QuizQuestion, qIndex: number) => (
              <article key={question.id || qIndex} className="quiz-question-card">
                <div className="quiz-question-card__header">
                  <span className="quiz-question-number">#{qIndex + 1}</span>
                  <h4 className="quiz-question-title">{question.title}</h4>
                  
                  <div className="quiz-question-params">
                    {question.timeLimit && (
                      <span className="param-pill">⏱ {question.timeLimit}с</span>
                    )}
                    {question.points && (
                      <span className="param-pill">⭐ {question.points} б.</span>
                    )}
                  </div>
                </div>

                {question.img && (
                  <div className="quiz-question-image-wrapper">
                    <img
                      src={question.img}
                      alt={`Запитання ${qIndex + 1}`}
                      className="quiz-question-image"
                    />
                  </div>
                )}

                {question.variants && question.variants.length > 0 && (
                  <div className="quiz-variants-grid">
                    {question.variants.map((variant: QuestionVariant, vIndex: number) => {
                      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                      const letter = letters[vIndex] || String(vIndex + 1);

                      return (
                        <div key={variant.id || vIndex} className="quiz-variant-item">
                          <span className="quiz-variant-letter">{letter}</span>
                          <span className="quiz-variant-text">{variant.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
