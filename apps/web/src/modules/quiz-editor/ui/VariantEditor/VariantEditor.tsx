import { useEffect } from 'react';
import type { VariantEditorProps } from './VariantEditor.types';
import { CloseIcon, PlusIcon } from '../../../../shared';
import styles from './VariantEditor.module.css';

const COLORS = [
  '#ef4444', '#3b82f6', '#f59e0b', '#22c55e',
  '#a855f7', '#ec4899', '#6366f1', '#14b8a6'
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
    const isCurrentlyCorrect = Boolean(variants[index]?.isCorrect);
    const newVariants = variants.map((v, i) => {
      if (questionType === 'ONE_ANSWER') {
        return {
          ...v,
          isCorrect: i === index ? !isCurrentlyCorrect : false,
        };
      } else {
        return {
          ...v,
          isCorrect: i === index ? !isCurrentlyCorrect : Boolean(v.isCorrect),
        };
      }
    });

    onChange(newVariants);
  };

  const handleDelete = (index: number) => {
    if (variants.length <= 2) return;
    const newVariants = variants
      .filter((_, i) => i !== index)
      .map((v, i) => ({ ...v, order: i }));
    onChange(newVariants);
  };

  const handleAdd = () => {
    if (variants.length >= 8) return;
    onChange([
      ...variants,
      { text: '', type: 'TEXT', isCorrect: false, order: variants.length }
    ]);
  };

  return (
    <div className={styles['variant-editor']}>
      <div className={styles['variant-grid']}>
        {variants.map((variant, index) => {
          const color = COLORS[index % COLORS.length];
          const isCorrect = Boolean(variant.isCorrect);

          return (
            <div
              key={variant.id ?? `temp-var-${index}`}
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
                      {isCorrect && <span className={styles['indicator-check']}>✓</span>}
                    </div>
                  ) : (
                    <div className={`${styles['checkbox-indicator']} ${isCorrect ? styles['active'] : ''}`}>
                      {isCorrect && <span className={styles['indicator-check']}>✓</span>}
                    </div>
                  )}
                </button>
                {variants.length > 2 && (
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
      {variants.length < 8 && (
        <button type="button" className={styles['variant-add-btn']} onClick={handleAdd}>
          <PlusIcon width={16} height={16} />
          <span>Додати варіант</span>
        </button>
      )}
    </div>
  );
};
