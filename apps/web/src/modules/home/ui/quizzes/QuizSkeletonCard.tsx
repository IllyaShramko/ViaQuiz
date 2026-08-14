export function QuizSkeletonCard() {
  return (
    <div className="quiz-card quiz-card--skeleton">
      <div className="quiz-card__header quiz-card__header--skeleton" />
      <div className="quiz-card__body">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--author" />
        <div className="skeleton-line skeleton-line--desc" />
        <div className="skeleton-line skeleton-line--desc-short" />
      </div>
    </div>
  );
}
