import { isTypeAnswerV2Bracket, normalizeTypedAnswerWhitespace } from '@viaquiz/utils';
import {
  CheckIcon,
  ExpandIcon,
  KeyboardIcon,
  MultipleIcon,
  OneAnswerIcon,
  StarIcon,
  TimerIcon,
} from '../../../../shared';
import type { QuestionVariant } from '../../models';
import {
  formatAnswerVariantsCount,
  getQuestionDurationSec,
  getQuestionTypeMeta,
} from '../../utils';
import type { QuizQuestionCardProps } from './QuizQuestionCard.types';
import styles from './QuizQuestionCard.module.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function renderTypeIcon(kind: 'single' | 'multiple' | 'typed' | 'letters') {
  switch (kind) {
    case 'multiple':
      return <MultipleIcon size={13} aria-hidden="true" />;
    case 'typed':
    case 'letters':
      return <KeyboardIcon size={13} aria-hidden="true" />;
    case 'single':
    default:
      return <OneAnswerIcon size={13} aria-hidden="true" />;
  }
}

export function QuizQuestionCard({
  question,
  index,
  showCorrectAnswers = false,
  onPreviewImage,
}: QuizQuestionCardProps) {
  const timeSec = getQuestionDurationSec(question.timeLimit);
  const questionText = question.text || question.title || '';
  const questionImage = question.media || question.img || null;
  const variants = question.variants || [];
  const typeMeta = getQuestionTypeMeta(question.type);

  const isChoiceQuestion =
    question.type === 'ONE_ANSWER' || question.type === 'MANY_ANSWERS';
  const isTypeAnswerV1 = question.type === 'TYPE_ANSWER_V1';
  const isTypeAnswerV2 = question.type === 'TYPE_ANSWER_V2';

  const hasAnswerBlock =
    (isChoiceQuestion && variants.length > 0) || isTypeAnswerV1 || isTypeAnswerV2;

  const renderTypeAnswerV1 = () => {
    const acceptedAnswers = variants
      .map((variant) => variant.text?.trim())
      .filter((text): text is string => Boolean(text));

    return (
      <div className={styles.typeAnswerBox}>
        <div className={styles.typeAnswerHeader}>
          <span className={styles.typeAnswerLabel}>Очікувана відповідь</span>
        </div>

        {showCorrectAnswers ? (
          acceptedAnswers.length > 0 ? (
            <div className={styles.typeAnswerChips}>
              {acceptedAnswers.map((answerText, answerIndex) => (
                <span key={answerIndex} className={styles.typeAnswerChip}>
                  <CheckIcon size={13} aria-hidden="true" />
                  <span>{answerText}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.typeAnswerHiddenText}>Правильну відповідь не вказано</p>
          )
        ) : (
          <p className={styles.typeAnswerHiddenText}>
            {acceptedAnswers.length > 0
              ? `Приховано (${formatAnswerVariantsCount(acceptedAnswers.length)})`
              : 'Відкрита текстова відповідь'}
          </p>
        )}
      </div>
    );
  };

  const renderTypeAnswerV2 = () => {
    const rawAnswer = variants[0]?.text || '';
    const normalized = normalizeTypedAnswerWhitespace(rawAnswer);
    const words = normalized ? normalized.split(' ') : [];

    return (
      <div className={styles.typeAnswerBox}>
        <div className={styles.typeAnswerHeader}>
          <span className={styles.typeAnswerLabel}>
            {showCorrectAnswers ? 'Правильна відповідь' : 'Шаблон відповіді'}
          </span>
        </div>

        {words.length > 0 ? (
          <div
            className={styles.typeAnswerV2Words}
            aria-label={
              showCorrectAnswers
                ? `Правильна відповідь: ${normalized}`
                : 'Замаскований шаблон відповіді по літерах'
            }
          >
            {words.map((word, wIndex) => (
              <div key={wIndex} className={styles.typeAnswerV2Word}>
                {Array.from(word).map((char, cIndex) =>
                  isTypeAnswerV2Bracket(char) ? (
                    <span key={`${wIndex}-${cIndex}`} className={styles.letterBracket}>
                      {char}
                    </span>
                  ) : (
                    <span
                      key={`${wIndex}-${cIndex}`}
                      className={`${styles.letterBox} ${
                        showCorrectAnswers ? styles.letterBoxRevealed : ''
                      }`}
                    >
                      {showCorrectAnswers ? char : ''}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.typeAnswerHiddenText}>Відповідь по літерах не вказано</p>
        )}
      </div>
    );
  };

  const answerBlock = (
    <>
      {isChoiceQuestion && variants.length > 0 && (
        <ul className={styles.variantsGrid} aria-label="Варіанти відповіді">
          {variants.map((variant: QuestionVariant, vIndex: number) => {
            const letter = LETTERS[vIndex] || String(vIndex + 1);
            const isHighlightedCorrect = Boolean(showCorrectAnswers && variant.isCorrect);
            const hasVariantImage = variant.type === 'IMAGE' && Boolean(variant.media);

            return (
              <li
                key={variant.id || vIndex}
                className={`${styles.variantItem} ${
                  isHighlightedCorrect ? styles.variantCorrect : ''
                }`}
              >
                <span className={styles.variantLetter}>{letter}</span>

                <div className={styles.variantContent}>
                  {hasVariantImage &&
                    variant.media &&
                    (onPreviewImage ? (
                      <button
                        type="button"
                        className={styles.variantImageBtn}
                        onClick={() =>
                          onPreviewImage({
                            src: variant.media!,
                            alt: variant.text || `Варіант ${letter}`,
                          })
                        }
                        aria-label={`Збільшити зображення варіанта ${letter}`}
                      >
                        <img
                          src={variant.media}
                          alt={variant.text || `Варіант ${letter}`}
                          className={styles.variantImageThumb}
                        />
                      </button>
                    ) : (
                      <img
                        src={variant.media}
                        alt={variant.text || `Варіант ${letter}`}
                        className={styles.variantImageThumb}
                      />
                    ))}

                  {variant.text && (
                    <span className={styles.variantText}>{variant.text}</span>
                  )}
                </div>

                {isHighlightedCorrect && (
                  <CheckIcon
                    size={14}
                    className={styles.correctCheckIcon}
                    aria-label="Правильна відповідь"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isTypeAnswerV1 && renderTypeAnswerV1()}
      {isTypeAnswerV2 && renderTypeAnswerV2()}
    </>
  );

  const mediaThumbnail = questionImage && (
    <div className={styles.mediaSlot}>
      {onPreviewImage ? (
        <button
          type="button"
          className={styles.mediaThumbBtn}
          onClick={() =>
            onPreviewImage({
              src: questionImage,
              alt: questionText || `Зображення до запитання ${index + 1}`,
            })
          }
          aria-label={`Збільшити зображення до запитання ${index + 1}`}
        >
          <img
            src={questionImage}
            alt={questionText || `Запитання ${index + 1}`}
            className={styles.mediaThumbImg}
          />
          <span className={styles.zoomIndicator} aria-hidden="true">
            <ExpandIcon size={12} />
          </span>
        </button>
      ) : (
        <div className={styles.mediaThumbStatic}>
          <img
            src={questionImage}
            alt={questionText || `Запитання ${index + 1}`}
            className={styles.mediaThumbImg}
          />
        </div>
      )}
    </div>
  );

  return (
    <article className={styles.card}>
      <div className={styles.metaRow}>
        <div className={styles.metaLeft}>
          <span className={styles.indexBadge}>№{index + 1}</span>
          <span className={styles.typeBadge}>
            {renderTypeIcon(typeMeta.kind)}
            <span>{typeMeta.label}</span>
          </span>
        </div>

        <div className={styles.paramsGroup}>
          {timeSec > 0 && (
            <span className={styles.paramPill}>
              <TimerIcon size={13} aria-hidden="true" />
              <span>{timeSec} с</span>
            </span>
          )}
          {question.points !== undefined && question.points !== null && (
            <span className={styles.paramPill}>
              <StarIcon size={12} aria-hidden="true" />
              <span>{question.points} б.</span>
            </span>
          )}
        </div>
      </div>

      <h4 className={styles.questionTitle}>
        {questionText || `Запитання ${index + 1}`}
      </h4>

      {questionImage && hasAnswerBlock ? (
        <div className={styles.bodyWithMedia}>
          <div className={styles.answerColumn}>{answerBlock}</div>
          {mediaThumbnail}
        </div>
      ) : (
        <>
          {mediaThumbnail}
          {answerBlock}
        </>
      )}
    </article>
  );
}
