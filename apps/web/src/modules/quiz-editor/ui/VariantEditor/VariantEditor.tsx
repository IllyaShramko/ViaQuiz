import { useEffect } from 'react';
import { MAX_QUESTION_VARIANTS, MIN_QUESTION_VARIANTS } from '@viaquiz/shared-types';
import type { VariantEditorProps } from './VariantEditor.types';
import { CloseIcon, PlusIcon, CheckIcon } from '../../../../shared';
import styles from './VariantEditor.module.css';

const COLORS = [
  '#2563eb', '#d97706', '#16a34a', '#db2777', '#7c3aed', '#0891b2'
];

export const VariantEditor: React.FC<VariantEditorProps> = ({ variants, questionType, onChange }) => {
  // Ensure we have at least 4 empty variants for new questions
  useEffect(() => {
    if (variants.length === 0) {
      onChange(
        Array.from({ length: 4 }).map((_, i) => ({
          text: '',
          type: 'TEXT',
          isCorrect: false,
          order: i
        }))
      );
    }
  }, [variants.length, onChange]);

  if (variants.length === 0) return null;

  const handleUpdateText = (index: number, text: string) => {
    const newVariants = variants.map((v, i) => (i === index ? { ...v, text } : v));
    onChange(newVariants);
  };

  const handleToggleCorrect = (index: number) => {
    if (questionType === 'ONE_ANSWER') {
      const newVariants = variants.map((v, i) => ({
        ...v,
        isCorrect: i === index
      }));
      onChange(newVariants);
    } else {
      const newVariants = variants.map((v, i) => (i === index ? { ...v, isCorrect: !v.isCorrect } : v));
      onChange(newVariants);
    }
  };

  const handleDelete = (index: number) => {
    if (variants.length <= MIN_QUESTION_VARIANTS) return;
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
  };

  const handleAdd = () => {
    if (variants.length >= MAX_QUESTION_VARIANTS) return;
    onChange([
      ...variants,
      {
        text: '',
        type: 'TEXT',
        isCorrect: false,
        order: variants.length
      }
    ]);
  };

  return (
    <div className={styles['variant-editor']}>
      <div className={styles['variant-grid']}>
        {variants.map((variant, index) => {
          const isCorrect = variant.isCorrect;
          const color = COLORS[index % COLORS.length];

          return (
            <div
              key={index}
              className={`${styles['variant-card']} ${isCorrect ? styles['is-correct'] : ''}`}
              style={{ '--variant-color': color } as React.CSSProperties}
            >
              <div className={styles['variant-color-stripe']} />
              <input
                type="text"
                className={styles['variant-input']}
                placeholder={`Варіант відповіді ${index + 1}`}
                value={variant.text || ''}
                onChange={(e) => handleUpdateText(index, e.target.value)}
              />
              <div className={styles['variant-actions']}>
                <button
                  type="button"
                  className={`${styles['variant-correct-toggle']} ${isCorrect ? styles['is-active'] : ''}`}
                  onClick={() => handleToggleCorrect(index)}
                  title={isCorrect ? 'Правильна відповідь (клікніть щоб зняти)' : 'Позначити як правильну'}
                  aria-label={isCorrect ? 'Зняти правильну відповідь' : 'Позначити як правильну'}
                >
                  {questionType === 'ONE_ANSWER' ? (
                    <div className={`${styles['radio-indicator']} ${isCorrect ? styles['active'] : ''}`}>
                      {isCorrect && <CheckIcon size={14} className={styles['indicator-check']} />}
                    </div>
                  ) : (
                    <div className={`${styles['checkbox-indicator']} ${isCorrect ? styles['active'] : ''}`}>
                      {isCorrect && <CheckIcon size={14} className={styles['indicator-check']} />}
                    </div>
                  )}
                </button>
                {variants.length > MIN_QUESTION_VARIANTS && (
                  <button
                    type="button"
                    className={styles['variant-delete-btn']}
                    onClick={() => handleDelete(index)}
                    title="Видалити варіант"
                    aria-label="Видалити варіант"
                  >
                    <CloseIcon width={14} height={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {variants.length < MAX_QUESTION_VARIANTS && (
        <button type="button" className={styles['variant-add-btn']} onClick={handleAdd}>
          <PlusIcon width={16} height={16} />
          <span>Додати варіант</span>
        </button>
      )}
    </div>
  );
};
