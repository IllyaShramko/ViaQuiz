import React from 'react';
import type { SaveStatus } from '../../models/types';
import { ArrowIcon, PublicIcon } from '../../../../shared';
import './EditorHeader.css';

interface EditorHeaderProps {
  quizName: string;
  saveStatus: SaveStatus;
  onNameChange: (name: string) => void;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
  isDraft: boolean;
  hasQuestions: boolean;
}

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
        return <span className="save-status saving">Зберігається...</span>;
      case 'saved':
        return <span className="save-status saved">✓ Збережено</span>;
      case 'error':
        return <span className="save-status error">Помилка збереження</span>;
      default:
        return null;
    }
  };

  const isButtonDisabled = !isDraft || isPublishing || !hasQuestions;

  return (
    <header className="editor-header">
      <div className="editor-header-left">
        <button type="button" className="editor-back-btn" onClick={onBack}>
          <ArrowIcon width={16} height={16} />
          <span>Назад</span>
        </button>
        <input
          type="text"
          className="editor-quiz-name-input"
          value={quizName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Назва квізу"
        />
      </div>
      
      <div className="editor-header-right">
        {renderSaveStatus()}
        
        <button
          type="button"
          className="editor-publish-btn"
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
