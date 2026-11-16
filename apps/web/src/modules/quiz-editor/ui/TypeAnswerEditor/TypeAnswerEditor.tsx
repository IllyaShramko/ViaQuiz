import { QUESTION_LIMITS } from '@viaquiz/shared-types';
import { isTypeAnswerV2Bracket, normalizeTypedAnswerWhitespace } from '@viaquiz/utils';
import type { EditorVariant } from '../../models';
import type { TypeAnswerEditorProps } from './TypeAnswerEditor.types';
import { CloseIcon, PlusIcon } from '../../../../shared';
import styles from './TypeAnswerEditor.module.css';

export function TypeAnswerEditor({ variants, answerType, onChange }: TypeAnswerEditorProps) {
  if (answerType === 'TYPE_ANSWER_V1') {
    const handleAdd = () => {
      if (variants.length >= 3) return;
      onChange([
        ...variants,
        { text: '', type: 'TEXT', isCorrect: true, order: variants.length }
      ]);
    };

    const handleUpdate = (index: number, text: string) => {
      const newVariants = [...variants];
      newVariants[index] = { ...newVariants[index], text: text.slice(0, QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH) };
      onChange(newVariants);
    };

    const handleDelete = (index: number) => {
      const newVariants = variants.filter((_, i) => i !== index);
      onChange(newVariants);
    };

    // Ensure we have at least one variant for TYPE_ANSWER_V1
    const activeVariants = variants.length > 0 ? variants : [{ text: '', type: 'TEXT', isCorrect: true, order: 0 } as EditorVariant];

    return (
      <div className={styles['type-answer-editor']}>
        {activeVariants.map((variant, index) => (
          <div key={variant.id ?? `temp-${index}`} className={styles['type-answer-item']}>
            <input
              type="text"
              maxLength={QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH}
              className={styles['type-answer-input']}
              placeholder={index === 0 ? "Правильна відповідь" : "Альтернативна відповідь"}
              value={variant.text || ''}
              onChange={(e) => handleUpdate(index, e.target.value)}
            />
            {index > 0 && (
              <button
                className={styles['type-answer-delete-btn']}
                onClick={() => handleDelete(index)}
                aria-label="Видалити"
                type="button"
              >
                <CloseIcon width={14} height={14} />
              </button>
            )}
          </div>
        ))}
        {activeVariants.length < 3 && (
          <button className={styles['type-answer-add-btn']} onClick={handleAdd} type="button">
            <PlusIcon width={16} height={16} />
            <span>Додати альтернативу</span>
          </button>
        )}
      </div>
    );
  }

  // TYPE_ANSWER_V2
  const variant = variants[0] || { text: '', type: 'TEXT', isCorrect: true, order: 0 } as EditorVariant;
  const wordText = variant.text || '';
  const normalizedPreview = normalizeTypedAnswerWhitespace(wordText);
  const previewWords = normalizedPreview ? normalizedPreview.split(' ') : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([{ ...variant, text: e.target.value.slice(0, QUESTION_LIMITS.MAX_TYPE_ANSWER_V2_LENGTH) }]);
  };

  return (
    <div className={styles['type-answer-editor']}>
      <div className={styles['type-answer-v2-field']}>
        <input
          type="text"
          maxLength={QUESTION_LIMITS.MAX_TYPE_ANSWER_V2_LENGTH}
          className={`${styles['type-answer-input']} ${styles['centered']}`}
          placeholder="Введіть відповідь (до 32 символів)"
          value={wordText}
          onChange={handleChange}
        />
        <div className={styles['type-answer-v2-meta']}>
          <span className={styles['type-answer-v2-hint']}>
            Пробіли розділяють слова, а дужки ( ) {`{ }`} [ ] лишаються підказкою.
          </span>
          <span className={styles['type-answer-v2-counter']}>
            {wordText.length} / {QUESTION_LIMITS.MAX_TYPE_ANSWER_V2_LENGTH}
          </span>
        </div>
      </div>

      {previewWords.length > 0 && (
        <div className={styles['type-answer-v2-preview']}>
          {previewWords.map((word, wIndex) => (
            <div key={wIndex} className={styles['type-answer-v2-word']}>
              {Array.from(word).map((char, cIndex) => (
                <div
                  key={`${wIndex}-${cIndex}`}
                  className={
                    isTypeAnswerV2Bracket(char)
                      ? styles['type-answer-v2-bracket']
                      : styles['type-answer-v2-box']
                  }
                >
                  {char}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
