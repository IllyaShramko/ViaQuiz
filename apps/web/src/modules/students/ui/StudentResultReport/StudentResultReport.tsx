import type { StudentResultReportProps } from './StudentResultReport.types';
import { NotFoundHeader } from '../../../not-found/ui/NotFoundHeader';
import styles from './StudentResultReport.module.css';

export function StudentResultReport({ report, homePath = '/student/dashboard' }: StudentResultReportProps) {
  const {
    quiz,
    totalQuestionsCount,
    correctAnswersCount,
    incorrectAnswersCount,
    skippedAnswersCount,
    totalTimeSpentSec,
    grade,
    percentage,
    questions = [],
  } = report;

  return (
    <div className={styles['report-container']}>
      {/* Header same style as 404 page */}
      <NotFoundHeader homePath={homePath} />

      <main className={styles['report-main']}>
        <h1 className={styles['report-title']}>Тест завершено!</h1>

        {/* 1. Summary Card */}
        <div className={styles['summary-card']}>
          <div className={styles['summary-header']}>
            <div>
              <h2 className={styles['quiz-title']}>{quiz.name}</h2>
              <div className={styles['quiz-meta']}>
                <span>Автор: {quiz.authorName}</span>
                <span>Вчитель: {quiz.teacherName}</span>
              </div>
            </div>

            <div className={styles['questions-badge']}>
              <div className={styles['questions-badge__num']}>{totalQuestionsCount}</div>
              <div className={styles['questions-badge__label']}>запитань</div>
            </div>
          </div>

          {/* 4 Stats Grid */}
          <div className={styles['metrics-grid']}>
            <div className={styles['metric-item']}>
              <span className={styles['metric-label']}>Сума балів</span>
              <span className={styles['metric-value']}>
                {correctAnswersCount} / {totalQuestionsCount}
              </span>
            </div>

            <div className={styles['metric-item']}>
              <span className={styles['metric-label']}>Загальний час</span>
              <span className={styles['metric-value']}>{totalTimeSpentSec} с</span>
            </div>

            <div className={styles['metric-item']}>
              <span className={styles['metric-label']}>Оцінка</span>
              <span className={styles['metric-value']}>{grade} / 12</span>
            </div>

            <div className={styles['metric-item']}>
              <span className={styles['metric-label']}>Результат</span>
              <span className={styles['metric-value']}>{percentage} %</span>
            </div>
          </div>

          {/* Indicator Track Bar */}
          <div className={styles['indicator-bar']}>
            {questions.map((q) => {
              let tileClass = styles['indicator-tile--skipped'];
              if (q.status === 'CORRECT') {
                tileClass = styles['indicator-tile--correct'];
              } else if (q.status === 'INCORRECT') {
                tileClass = styles['indicator-tile--incorrect'];
              }

              return (
                <div
                  key={q.questionId}
                  className={`${styles['indicator-tile']} ${tileClass}`}
                  title={`Запитання №${q.questionNumber}: ${
                    q.status === 'CORRECT' ? 'Правильно' : q.status === 'INCORRECT' ? 'Неправильно' : 'Пропущено'
                  }`}
                />
              );
            })}
          </div>

          {/* 3 Summary Chips */}
          <div className={styles['summary-chips']}>
            <div className={`${styles['summary-chip']} ${styles['summary-chip--correct']}`}>
              {correctAnswersCount} правильних
            </div>
            <div className={`${styles['summary-chip']} ${styles['summary-chip--incorrect']}`}>
              {incorrectAnswersCount} неправильних
            </div>
            <div className={`${styles['summary-chip']} ${styles['summary-chip--skipped']}`}>
              {skippedAnswersCount} пропущено
            </div>
          </div>
        </div>

        {/* 2. Question Breakdown Cards */}
        {questions.map((q) => {
          let cardStatusClass = styles['question-card--skipped'];
          if (q.status === 'CORRECT') {
            cardStatusClass = styles['question-card--correct'];
          } else if (q.status === 'INCORRECT') {
            cardStatusClass = styles['question-card--incorrect'];
          }

          return (
            <div
              key={q.questionId}
              className={`${styles['question-card']} ${cardStatusClass}`}
            >
              <div className={styles['question-card__header']}>
                <h3 className={styles['question-card__title']}>
                  Запитання №{q.questionNumber}:
                </h3>

                <div className={styles['question-card__badges']}>
                  <span className={styles['badge-time']}>{q.timeSpentSec} сек</span>
                  <span className={styles['badge-points']}>
                    {q.isCorrect ? '1/1' : '0/1'}
                  </span>
                </div>
              </div>

              <div className={styles['question-card__text']}>{q.text}</div>

              {q.media && (
                <img
                  src={q.media}
                  alt={`Запитання №${q.questionNumber}`}
                  className={styles['question-card__media']}
                />
              )}

              <div className={styles['question-card__answer']}>
                <span>Ваша відповідь: </span>
                <span
                  className={
                    q.isSkipped
                      ? styles['answer-highlight--skipped']
                      : styles['answer-highlight']
                  }
                >
                  {q.studentAnswer}
                </span>
              </div>

              <div className={styles['question-card__answer']}>
                <span>Правильна відповідь: </span>
                <span className={styles['answer-highlight']}>
                  {q.correctAnswer}
                </span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
