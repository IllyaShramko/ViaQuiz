import { useState } from 'react';
import { ViewEyeIcon, ViewEyeOffIcon } from '../../../../shared';
import { QuizQuestionCard } from '../QuizQuestionCard';
import type { QuizQuestionsListProps } from './QuizQuestionsList.types';
import styles from './QuizQuestionsList.module.css';

export function QuizQuestionsList({
  questions,
  title = 'Запитання',
  emptyMessage = 'У цій вікторині ще немає запитань.',
  onPreviewImage,
}: QuizQuestionsListProps) {
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.countPill}>{questions.length}</span>
        </div>

        {questions.length > 0 && (
          <button
            type="button"
            className={`${styles.toggleAnswersBtn} ${
              showCorrectAnswers ? styles.isActive : ''
            }`}
            aria-pressed={showCorrectAnswers}
            onClick={() => setShowCorrectAnswers((prev) => !prev)}
          >
            {showCorrectAnswers ? (
              <>
                <ViewEyeOffIcon size={15} aria-hidden="true" />
                <span>Приховати відповіді</span>
              </>
            ) : (
              <>
                <ViewEyeIcon size={15} aria-hidden="true" />
                <span>Показати відповіді</span>
              </>
            )}
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {questions.map((question, qIndex) => (
            <QuizQuestionCard
              key={question.id || qIndex}
              question={question}
              index={qIndex}
              showCorrectAnswers={showCorrectAnswers}
              onPreviewImage={onPreviewImage}
            />
          ))}
        </div>
      )}
    </section>
  );
}
