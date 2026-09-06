import type { QuestionVariant } from '../../models';
import type { QuizQuestionCardProps } from './QuizQuestionCard.types';
import { TimerIcon } from '../../../../shared/ui/icons';
import styles from '../QuizDetails.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuizQuestionCard({ question, index }: QuizQuestionCardProps) {
  const timeSec = question.timeLimit
    ? Math.round(question.timeLimit >= 1000 ? question.timeLimit / 1000 : question.timeLimit)
    : null;

  const questionText = question.text || question.title || '';
  const questionImage = question.media || question.img || null;
  const isMultipleChoice = question.type === 'ONE_ANSWER' || question.type === 'MANY_ANSWERS';

  return (
    <article className={styles['quiz-question-card']}>
      <div className={styles['quiz-question-card__header']}>
        <span className={styles['quiz-question-number']}>№{index + 1}</span>
        <h4 className={styles['quiz-question-title']}>
          {questionText || `Запитання ${index + 1}`}
        </h4>

        <div className={styles['quiz-question-params']}>
          {timeSec && (
            <span className={styles['param-pill']}>
              <TimerIcon size={14} /> {timeSec}с
            </span>
          )}
          {question.points && <span className={styles['param-pill']}>⭐ {question.points} б.</span>}
        </div>
      </div>

      {questionImage && (
        <div className={styles['quiz-question-image-wrapper']}>
          <img
            src={questionImage}
            alt={`Запитання ${index + 1}`}
            className={styles['quiz-question-image']}
          />
        </div>
      )}

      {isMultipleChoice && question.variants && question.variants.length > 0 && (
        <div className={styles['quiz-variants-grid']}>
          {question.variants.map((variant: QuestionVariant, vIndex: number) => {
            const letter = LETTERS[vIndex] || String(vIndex + 1);

            return (
              <div key={variant.id || vIndex} className={styles['quiz-variant-item']}>
                <span className={styles['quiz-variant-letter']}>{letter}</span>
                <span className={styles['quiz-variant-text']}>{variant.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
