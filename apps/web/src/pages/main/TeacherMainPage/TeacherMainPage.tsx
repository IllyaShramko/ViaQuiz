import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPublishedQuizzesQuery } from '../../../modules/home';
import './TeacherMainPage.css';

const GRADIENTS = [
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
];

export function TeacherMainPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPublishedQuizzesQuery({
    search: searchQuery || undefined,
    page: currentPage,
    limit,
  });

  const quizzes = data?.quizzes || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="teacher-main-page">
      {/* Search Hero */}
      <section className="teacher-hero-search">
        <h2 className="teacher-hero-search__title">Яка тема вам потрібна?</h2>

        <div className="teacher-search-box">
          <svg
            className="teacher-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="teacher-search-input"
            placeholder="Знайдіть будь-яку тему чи вікторину..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              type="button"
              className="teacher-search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Очистити пошук"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Quizzes List Section */}
      <section className="teacher-quizzes-section">
        <div className="teacher-quizzes-header">
          <h3 className="teacher-quizzes-title">Популярні вікторини</h3>
          <span className="teacher-quizzes-count">
            {isLoading ? 'Завантаження...' : `Всього: ${total}`}
          </span>
        </div>

        {/* Loading State */}
        {isLoading || isFetching ? (
          <div className="teacher-quizzes-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="teacher-quiz-card teacher-quiz-card--skeleton">
                <div className="teacher-quiz-card__cover teacher-quiz-skeleton-shimmer" />
                <div className="teacher-quiz-card__body">
                  <div className="teacher-skeleton-line teacher-skeleton-line--title" />
                  <div className="teacher-skeleton-line teacher-skeleton-line--desc" />
                  <div className="teacher-skeleton-line teacher-skeleton-line--desc-short" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="teacher-empty-state">
            <p>Не вдалося завантажити вікторини з сервера.</p>
            <button type="button" className="btn btn--secondary" onClick={() => refetch()}>
              Спробувати знову
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          /* Empty State */
          <div className="teacher-empty-state">
            <p>Вікторин за цим запитом поки немає.</p>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Створіть першу вікторину, натиснувши кнопку «+ Створити» зверху.
            </span>
          </div>
        ) : (
          /* Quizzes Grid */
          <div className="teacher-quizzes-grid">
            {quizzes.map((quiz, index) => {
              const bgGradient = GRADIENTS[index % GRADIENTS.length];
              const authorName =
                quiz.author.firstName && quiz.author.lastName
                  ? `${quiz.author.firstName} ${quiz.author.lastName}`
                  : quiz.author.firstName || quiz.author.login;
              const questionsCount = quiz._count?.questions ?? 0;

              return (
                <article
                  key={quiz.id}
                  className="teacher-quiz-card is-clickable"
                  onClick={() => navigate(`/quiz/${quiz.uuid}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/quiz/${quiz.uuid}`);
                    }
                  }}
                >
                  <div
                    className="teacher-quiz-card__cover"
                    style={{
                      background: quiz.coverImg ? `url(${quiz.coverImg}) center/cover` : bgGradient,
                    }}
                  >
                    <div className="teacher-quiz-card__logo-watermark">
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(-164, -2239)">
                          <path
                            fill="currentColor"
                            d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>

                  <div className="teacher-quiz-card__body">
                    <h4 className="teacher-quiz-card__title">{quiz.name}</h4>
                    <p className="teacher-quiz-card__desc">
                      {quiz.description || 'Опис відсутній'}
                    </p>

                    <div className="teacher-quiz-card__divider" />

                    <div className="teacher-quiz-card__footer">
                      <div className="teacher-quiz-card__meta">
                        <span className="teacher-quiz-card__questions">
                          {questionsCount} запитань
                        </span>
                        <span className="teacher-quiz-card__author">
                          Автор: <strong>{authorName}</strong>
                        </span>
                      </div>

                      <span className="teacher-quiz-card__arrow">→</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="teacher-pagination">
            <button
              type="button"
              className="teacher-pagination__btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ←
            </button>
            <span className="teacher-pagination__info">
              Сторінка {currentPage} з {totalPages}
            </span>
            <button
              type="button"
              className="teacher-pagination__btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
