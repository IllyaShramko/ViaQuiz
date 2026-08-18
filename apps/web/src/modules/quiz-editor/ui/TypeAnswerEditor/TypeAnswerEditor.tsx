import React from 'react';
import type { EditorVariant } from '../../models/types';
import { CloseIcon, PlusIcon } from '../../../../shared';
import styles from './TypeAnswerEditor.module.css';

export interface TypeAnswerEditorProps {
  variants: EditorVariant[];
  answerType: 'TYPE_ANSWER_V1' | 'TYPE_ANSWER_V2';
  onChange: (variants: EditorVariant[]) => void;
}

export const TypeAnswerEditor: React.FC<TypeAnswerEditorProps> = ({ variants, answerType, onChange }) => {
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
      newVariants[index] = { ...newVariants[index], text };
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([{ ...variant, text: e.target.value.toUpperCase() }]);
  };

  return (
    <div className={styles['type-answer-editor']}>
      <input
        type="text"
        className={`${styles['type-answer-input']} ${styles['centered']}`}
        placeholder="Введіть слово"
        value={wordText}
        onChange={handleChange}
      />
      <div className={styles['type-answer-v2-preview']}>
        {wordText.split('').map((letter, i) => (
          <div key={i} className={styles['type-answer-v2-box']}>
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
};
