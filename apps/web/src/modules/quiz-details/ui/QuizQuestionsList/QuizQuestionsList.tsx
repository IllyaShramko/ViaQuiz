import type { QuizQuestion } from '../../models';
import { QuizQuestionCard } from '../QuizQuestionCard';
import styles from '../QuizDetails.module.css';

export interface QuizQuestionsListProps {
  questions: QuizQuestion[];
  title?: string;
  emptyMessage?: string;
}

export function QuizQuestionsList({
  questions,
  title = 'Запитання',
  emptyMessage = 'У цій вікторині ще немає запитань.',
}: QuizQuestionsListProps) {
  return (
    <section className={styles['quiz-questions-section']}>
      <div className={styles['quiz-questions-section__header']}>
        <h3 className={styles['quiz-questions-section__title']}>
          {title} ({questions.length})
        </h3>
      </div>

      {questions.length === 0 ? (
        <div className={styles['quiz-questions-empty']}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles['quiz-questions-list']}>
          {questions.map((question, qIndex) => (
            <QuizQuestionCard
              key={question.id || qIndex}
              question={question}
              index={qIndex}
            />
          ))}
        </div>
      )}
    </section>
  );
}
