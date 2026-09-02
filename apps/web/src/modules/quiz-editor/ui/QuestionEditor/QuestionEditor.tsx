import { useEffect, useRef, useState } from 'react';
import { VariantEditor } from '../VariantEditor';
import { TypeAnswerEditor } from '../TypeAnswerEditor';
import { useUploadImageMutation } from '../../api/quizEditorApi';
import type { QuestionEditorProps } from './QuestionEditor.types';
import { UploadIcon, BinIcon } from '../../../../shared';
import styles from './QuestionEditor.module.css';

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate }) => {
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question.text]);

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
    <div className={styles['question-editor']}>
      <div className={styles['question-editor-header']}>
        <div
          className={styles['question-text-box']}
          onClick={() => textareaRef.current?.focus()}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            className={styles['question-text-input']}
            placeholder="Введіть текст запитання..."
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
          />
        </div>

        <div className={styles['question-media-area']}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
          />

          {question.media ? (
            <div className={styles['media-preview']}>
              <img src={question.media} alt="Question media" />
              <button
                type="button"
                className={styles['media-remove-btn']}
                onClick={() => onUpdate({ media: null })}
                title="Видалити зображення"
              >
                <BinIcon width={14} height={14} />
                <span>Видалити</span>
              </button>
            </div>
          ) : (
            <div
              className={`${styles['media-placeholder']} ${isDragOver ? styles['is-dragover'] : ''} ${isUploading ? styles['is-uploading'] : ''}`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <>
                  <div className={styles['media-upload-spinner']} />
                  <span>Завантаження зображення...</span>
                </>
              ) : (
                <div className={styles['media-placeholder-inner']}>
                  <UploadIcon width={28} height={28} />
                  <span className={styles['placeholder-main']}>Додати медіа (або перетягніть сюди)</span>
                  <span className={styles['placeholder-sub']}>PNG, JPG, WebP (до 5 МБ)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles['question-editor-body']}>
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
    </div>
  );
};
