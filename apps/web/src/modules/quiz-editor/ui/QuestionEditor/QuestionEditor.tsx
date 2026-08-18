import React, { useRef, useState } from 'react';
import { VariantEditor } from '../VariantEditor/VariantEditor';
import { TypeAnswerEditor } from '../TypeAnswerEditor/TypeAnswerEditor';
import { useUploadImageMutation } from '../../api/quizEditorApi';
import type { EditorQuestion, EditorVariant, QuestionType } from '../../models/types';
import { UploadIcon, BinIcon } from '../../../../shared';
import './QuestionEditor.css';

interface QuestionEditorProps {
  question: EditorQuestion;
  onUpdate: (data: Partial<{ text: string; media: string | null; type: QuestionType; timeLimit: number; points: number; variants: EditorVariant[] }>) => void;
  onSave?: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, onSave }) => {
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Будь ласка, оберіть файл зображення');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Розмір файлу не може перевищувати 5 МБ');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      if (res.data?.url) {
        onUpdate({ media: res.data.url });
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Помилка при завантаженні зображення. Спробуйте ще раз.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="question-editor">
      <div className="question-editor-header">
        <textarea
          className="question-text-input"
          placeholder="Введіть текст запитання..."
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
        
        <div className="question-media-area">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
          />

          {question.media ? (
            <div className="media-preview">
              <img src={question.media} alt="Question media" />
              <button 
                type="button"
                className="media-remove-btn"
                onClick={() => onUpdate({ media: null })}
                title="Видалити зображення"
              >
                <BinIcon width={14} height={14} />
                <span>Видалити</span>
              </button>
            </div>
          ) : (
            <div
              className={`media-placeholder ${isDragOver ? 'is-dragover' : ''} ${isUploading ? 'is-uploading' : ''}`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <>
                  <div className="media-upload-spinner" />
                  <span>Завантаження зображення...</span>
                </>
              ) : (
                <div className="media-placeholder-inner">
                  <UploadIcon width={28} height={28} />
                  <span className="placeholder-main">Додати медіа (або перетягніть сюди)</span>
                  <span className="placeholder-sub">PNG, JPG, WebP (до 5 МБ)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="question-editor-body">
        {(question.type === 'ONE_ANSWER' || question.type === 'MANY_ANSWERS') && (
          <VariantEditor
            variants={question.variants}
            questionType={question.type}
            onChange={(variants) => onUpdate({ variants })}
          />
        )}

        {(question.type === 'TYPE_ANSWER_V1' || question.type === 'TYPE_ANSWER_V2') && (
          <TypeAnswerEditor
            variants={question.variants}
            answerType={question.type}
            onChange={(variants) => onUpdate({ variants })}
          />
        )}
      </div>

      {onSave && (
        <div className="question-editor-footer">
          <button
            type="button"
            className="btn-save-question"
            onClick={onSave}
            title="Зберегти питання та повернутися до вибору"
          >
            Зберегти
          </button>
        </div>
      )}
    </div>
  );
};
