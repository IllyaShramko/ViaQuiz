import type { ReactNode } from 'react';
import type { QuestionType } from '../../models';
import type { QuestionTypeSelectorProps } from './QuestionTypeSelector.types';
import { OneAnswerIcon, MultipleIcon, EnterIcon } from '../../../../shared';
import styles from './QuestionTypeSelector.module.css';

const types: {
  type: QuestionType;
  icon: ReactNode;
  title: string;
  description: string;
}[] = [
  {
    type: 'ONE_ANSWER',
    icon: <OneAnswerIcon width={36} height={36} />,
    title: 'Один варіант',
    description: 'Оберіть одну правильну відповідь',
  },
  {
    type: 'MANY_ANSWERS',
    icon: <MultipleIcon width={36} height={36} />,
    title: 'Кілька варіантів',
    description: 'Оберіть кілька правильних відповідей',
  },
  {
    type: 'TYPE_ANSWER_V1',
    icon: <EnterIcon width={36} height={36} />,
    title: 'Ввід відповіді',
    description: 'Введіть відповідь цілим словом',
  },
  {
    type: 'TYPE_ANSWER_V2',
    icon: <EnterIcon width={36} height={36} />,
    title: 'По буквах',
    description: 'Вгадайте слово по буквах',
  },
];

export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className={styles['question-type-selector-container']}>
      <h2 className={styles['question-type-selector-title']}>Виберіть тип питання</h2>
      <div className={styles['question-type-selector-grid']}>
        {types.map(({ type, icon, title, description }) => (
          <button
            key={type}
            className={styles['question-type-card']}
            onClick={() => onSelect(type)}
            type="button"
          >
            <div className={styles['question-type-icon']}>{icon}</div>
            <h3 className={styles['question-type-card-title']}>{title}</h3>
            <p className={styles['question-type-card-desc']}>{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
