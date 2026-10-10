import styles from './HeroPreview.module.css';

const ANSWERS = [
  { shape: '▲', value: '54', tone: 'a' },
  { shape: '◆', value: '56', tone: 'b', isCorrect: true },
  { shape: '●', value: '58', tone: 'c' },
  { shape: '■', value: '64', tone: 'd' },
] as const;

/** Purely decorative mock of a live quiz question. */
export function HeroPreview() {
  return (
    <div className={styles['preview']} aria-hidden="true">
      <div className={styles['preview__bar']}>
        <span className={styles['preview__meta']}>PIN 482 915</span>
        <span className={styles['preview__meta']}>3 / 10</span>
      </div>
      <div className={styles['preview__timer']}>
        <span className={styles['preview__timer-fill']} />
      </div>
      <p className={styles['preview__question']}>7 × 8 = ?</p>
      <div className={styles['preview__answers']}>
        {ANSWERS.map((answer) => (
          <div
            key={answer.value}
            className={`${styles['preview__answer']} ${styles[`preview__answer--${answer.tone}`]} ${
              'isCorrect' in answer ? styles['preview__answer--correct'] : ''
            }`}
          >
            <span className={styles['preview__shape']}>{answer.shape}</span>
            {answer.value}
          </div>
        ))}
      </div>
      <div className={styles['preview__footer']}>
        <span className={styles['preview__meta']}>24 players</span>
      </div>
    </div>
  );
}
