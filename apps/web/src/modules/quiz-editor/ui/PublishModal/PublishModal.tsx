import { useState, useRef, useEffect } from 'react';
import type { PublishModalProps } from './PublishModal.types';
import { useUpdateQuizMutation, usePublishQuizMutation, useUploadImageMutation } from '../../api/quizEditorApi';
import { CloseIcon, UploadIcon, BinIcon, PublicIcon } from '../../../../shared';
import { extractPublishErrors, validateQuiz } from '../../utils/quizValidation';
import styles from './PublishModal.module.css';

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onPublishSuccess,
}) => {
  const [name, setName] = useState(quiz.name || '');
  const [description, setDescription] = useState(quiz.description || '');
  const [coverImg, setCoverImg] = useState<string | null>(quiz.coverImg || null);
  const [keywords, setKeywords] = useState<string[]>(
    (quiz.keywords || []).map((k) => k.name)
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const isSubmitting = isUpdating || isPublishing;

  // Sync state when quiz prop or modal opening changes
  useEffect(() => {
    if (isOpen) {
      setName(quiz.name || '');
      setDescription(quiz.description || '');
      setCoverImg(quiz.coverImg || null);
      setKeywords((quiz.keywords || []).map((k) => k.name));
      setValidationErrors([]);
    }
  }, [isOpen, quiz]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Будь ласка, оберіть файл зображення');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Розмір файлу не повинен перевищувати 5 МБ');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      if (res.data?.url) {
        setCoverImg(res.data.url);
      }
    } catch (err) {
      console.error('Failed to upload cover image:', err);
      alert('Помилка при завантаженні зображення. Спробуйте ще раз.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
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

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().replace(/^#/, '');
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 10) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationErrors(['Введіть назву вікторини']);
      return;
    }

    // Pre-validate quiz questions before network requests
    const preValidationErrors = validateQuiz({
      ...quiz,
      name: trimmedName,
    });

    if (preValidationErrors.length > 0) {
      setValidationErrors(preValidationErrors);
      return;
    }

    try {
      // 1. Update quiz details
      await updateQuiz({
        id: quiz.id,
        body: {
          name: trimmedName,
          description: description.trim() || null,
          coverImg: coverImg || null,
          keywords,
        },
      }).unwrap();

      // 2. Publish quiz
      await publishQuiz(quiz.id).unwrap();

      onPublishSuccess();
    } catch (err: unknown) {
      console.error('Publish error:', err);
      const errors = extractPublishErrors(err);
      setValidationErrors(errors);
    }
  };

  return (
    <div className={styles['publish-modal-overlay']} onClick={onClose}>
      <div
        className={styles['publish-modal-card']}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles['publish-modal-header']}>
          <div className={styles['publish-modal-title-group']}>
            <h2 className={styles['publish-modal-title']}>Публікація вікторини</h2>
            <p className={styles['publish-modal-subtitle']}>
              Заповніть інформацію, щоб гравці могли легко знайти ваш квіз
            </p>
          </div>
          <button
            type="button"
            className={styles['publish-modal-close-btn']}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Закрити"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationErrors.length > 0 && (
          <div className={styles['publish-modal-errors']}>
            <h4>Неможливо опублікувати:</h4>
            <ul>
              {validationErrors.map((errMsg, i) => (
                <li key={i}>{errMsg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles['publish-modal-form']}>
          <div className={styles['publish-modal-scrollable']}>
            {/* Cover Image Upload Area */}
            <div className={styles['publish-form-group']}>
              <label className={styles['publish-form-label']}>
                Обкладинка вікторини
                <span className={styles['publish-label-hint']}>Рекомендовано 16:9 (до 5 МБ)</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: 'none' }}
              />

              <div
                className={`${styles['publish-cover-box']} ${isDragOver ? styles['is-dragover'] : ''} ${isUploading ? styles['is-uploading'] : ''}`}
                style={{
                  backgroundImage: coverImg ? `url(${coverImg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                {isUploading ? (
                  <div className={styles['publish-cover-loading']}>
                    <div className={styles['publish-spinner']} />
                    <span>Завантаження...</span>
                  </div>
                ) : coverImg ? (
                  <div className={styles['publish-cover-overlay']}>
                    <button
                      type="button"
                      className={styles['publish-cover-remove-btn']}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImg(null);
                      }}
                      title="Видалити обкладинку"
                    >
                      <BinIcon width={14} height={14} />
                      <span>Змінити</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles['publish-cover-placeholder']}>
                    <UploadIcon width={32} height={32} />
                    <span className={styles['placeholder-main']}>Натисніть або перетягніть обкладинку</span>
                    <span className={styles['placeholder-sub']}>PNG, JPG, WebP (до 5 МБ)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Name */}
            <div className={styles['publish-form-group']}>
              <div className={styles['publish-label-row']}>
                <label htmlFor="quiz-name" className={`${styles['publish-form-label']} ${styles['required']}`}>
                  Назва вікторини
                </label>
                <span className={styles['publish-char-count']}>{name.length}/100</span>
              </div>
              <input
                id="quiz-name"
                type="text"
                className={styles['publish-form-input']}
                placeholder="Введіть цікаву назву вікторини..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                autoFocus
              />
            </div>

            {/* Quiz Description */}
            <div className={styles['publish-form-group']}>
              <div className={styles['publish-label-row']}>
                <label htmlFor="quiz-desc" className={styles['publish-form-label']}>
                  Опис
                </label>
                <span className={styles['publish-char-count']}>{description.length}/500</span>
              </div>
              <textarea
                id="quiz-desc"
                className={styles['publish-form-textarea']}
                placeholder="Коротко розкажіть, про що ця вікторина і для кого вона призначена..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            {/* Keywords / Tags */}
            <div className={styles['publish-form-group']}>
              <label htmlFor="quiz-keywords" className={styles['publish-form-label']}>
                Теги (ключові слова)
                <span className={styles['publish-label-hint']}>Натисніть Enter щоб додати тег</span>
              </label>

              <div className={styles['publish-tags-container']}>
                {keywords.map((tag, idx) => (
                  <span key={idx} className={styles['publish-tag-pill']}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className={styles['publish-tag-remove']}
                      aria-label={`Видалити тег ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {keywords.length < 10 && (
                  <input
                    id="quiz-keywords"
                    type="text"
                    className={styles['publish-tags-input']}
                    placeholder={keywords.length === 0 ? "наприклад: історія, 9 клас" : "додати тег..."}
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={handleAddKeyword}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles['publish-modal-footer']}>
            <button
              type="button"
              className={styles['publish-btn-cancel']}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Скасувати
            </button>

            <button
              type="submit"
              className={styles['publish-btn-submit']}
              disabled={isSubmitting || !name.trim()}
            >
              <PublicIcon width={16} height={16} />
              <span>{isSubmitting ? 'Публікація...' : 'Опублікувати квіз'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
