import type { EditorHeaderProps } from './EditorHeader.types';
import { ArrowIcon, PublicIcon } from '../../../../shared';
import styles from './EditorHeader.module.css';

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  quizName,
  saveStatus,
  onNameChange,
  onPublish,
  onBack,
  isPublishing,
  isDraft,
  hasQuestions,
}) => {
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <span className={`${styles['save-status']} ${styles['saving']}`}>Зберігається...</span>;
      case 'saved':
        return <span className={`${styles['save-status']} ${styles['saved']}`}>✓ Збережено</span>;
      case 'error':
        return <span className={`${styles['save-status']} ${styles['error']}`}>Помилка збереження</span>;
      default:
        return null;
    }
  };

  const isButtonDisabled = !isDraft || isPublishing || !hasQuestions;

  return (
    <header className={styles['editor-header']}>
      <div className={styles['editor-header-left']}>
        <button type="button" className={styles['editor-back-btn']} onClick={onBack}>
          <ArrowIcon width={16} height={16} />
          <span>Назад</span>
        </button>
        <input
          type="text"
          className={styles['editor-quiz-name-input']}
          value={quizName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Назва квізу"
        />
      </div>

      <div className={styles['editor-header-right']}>
        {renderSaveStatus()}

        <button
          type="button"
          className={styles['editor-publish-btn']}
          onClick={onPublish}
          disabled={isButtonDisabled}
          title={
            !hasQuestions
              ? 'Додайте хоча б одне питання для публікації'
              : !isDraft
              ? 'Квіз уже опубліковано'
              : 'Опублікувати квіз'
          }
        >
          <PublicIcon width={16} height={16} />
          <span>{isPublishing ? 'Опублікування...' : (isDraft ? 'Опублікувати' : 'Опубліковано')}</span>
        </button>
      </div>
    </header>
  );
};
