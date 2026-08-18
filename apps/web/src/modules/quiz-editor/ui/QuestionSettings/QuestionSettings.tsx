import React from 'react';
import type { EditorQuestion, QuestionType } from '../../models/types';
import './QuestionSettings.css';

interface QuestionSettingsProps {
  question: EditorQuestion;
  onUpdate: (data: Partial<{ type: QuestionType; timeLimit: number; points: number }>) => void;
  onSave?: () => void;
}

export const QuestionSettings: React.FC<QuestionSettingsProps> = ({ question, onUpdate, onSave }) => {
  return (
    <aside className="question-settings">
      <div className="settings-group">
        <label className="settings-label" htmlFor="questionType">Тип питання</label>
        <select
          id="questionType"
          className="settings-select"
          value={question.type}
          onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
        >
          <option value="ONE_ANSWER">Один варіант</option>
          <option value="MANY_ANSWERS">Кілька варіантів</option>
          <option value="TYPE_ANSWER_V1">Ввід відповіді</option>
          <option value="TYPE_ANSWER_V2">По буквах</option>
        </select>
      </div>

      <div className="settings-group">
        <label className="settings-label" htmlFor="timeLimit">Час на відповідь</label>
        <select
          id="timeLimit"
          className="settings-select"
          value={question.timeLimit}
          onChange={(e) => onUpdate({ timeLimit: Number(e.target.value) })}
        >
          <option value="5000">5 сек</option>
          <option value="10000">10 сек</option>
          <option value="15000">15 сек</option>
          <option value="20000">20 сек</option>
          <option value="30000">30 сек</option>
          <option value="45000">45 сек</option>
          <option value="60000">60 сек</option>
          <option value="90000">90 сек</option>
          <option value="120000">120 сек</option>
        </select>
      </div>

      <div className="settings-group">
        <label className="settings-label" htmlFor="points">Бали</label>
        <select
          id="points"
          className="settings-select"
          value={question.points}
          onChange={(e) => onUpdate({ points: Number(e.target.value) })}
        >
          <option value="0">0</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
          <option value="2000">2000</option>
          <option value="3000">3000</option>
          <option value="5000">5000</option>
        </select>
      </div>

      {onSave && (
        <div className="settings-footer">
          <button
            type="button"
            className="settings-save-btn"
            onClick={onSave}
          >
            Зберегти
          </button>
        </div>
      )}
    </aside>
  );
};
