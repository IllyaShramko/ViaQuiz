import { useId, useRef, useState } from 'react';
import { Button, CloseIcon, Modal, PublicIcon, WarningIcon } from '../../../../shared';
import {
  usePublishQuizMutation,
  useUpdateQuizMutation,
  useUploadImageMutation,
} from '../../api/quizEditorApi';
import {
  PUBLISH_LIMITS,
  publishQuizSchema,
  validateCoverFile,
} from '../../models';
import { extractPublishErrors, validateQuiz } from '../../utils/quizValidation';
import { QuizCoverField } from '../QuizCoverField';
import type { PublishModalFormProps, PublishModalProps } from './PublishModal.types';
import styles from './PublishModal.module.css';

function PublishModalForm({
  formId,
  quiz,
  isUploading,
  onSubmitForm,
  onUploadCoverFile,
}: PublishModalFormProps) {
  const [name, setName] = useState(quiz.name || '');
  const [description, setDescription] = useState(quiz.description || '');
  const [coverImg, setCoverImg] = useState<string | null>(quiz.coverImg || null);
  const [keywords, setKeywords] = useState<string[]>(
    (quiz.keywords || []).map((k) => k.name),
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const nameErrorId = useId();

  const appendKeywords = (rawText: string) => {
    const candidates = rawText
      .split(',')
      .map((item) => item.trim().replace(/^#/, '').slice(0, PUBLISH_LIMITS.MAX_KEYWORD_LENGTH))
      .filter(Boolean);

    if (candidates.length === 0) return;

    setKeywords((prev) => {
      const next = [...prev];
      for (const candidate of candidates) {
        if (next.length >= PUBLISH_LIMITS.MAX_KEYWORDS) break;
        if (!next.includes(candidate)) {
          next.push(candidate);
        }
      }
      return next;
    });
  };

  const commitPendingKeyword = () => {
    if (!keywordInput.trim()) return;
    appendKeywords(keywordInput);
    setKeywordInput('');
  };

  const handleKeywordKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitPendingKeyword();
      return;
    }

    if (event.key === 'Backspace' && keywordInput === '' && keywords.length > 0) {
      setKeywords((prev) => prev.slice(0, -1));
    }
  };

  const handleKeywordPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    if (!pasted.includes(',')) return;
    event.preventDefault();
    appendKeywords(pasted);
  };

  const handleUploadFile = async (file: File) => {
    setUploadError(null);
    const fileError = validateCoverFile(file);
    if (fileError) {
      setUploadError(fileError);
      return;
    }

    const result = await onUploadCoverFile(file);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    if (result.url) {
      setCoverImg(result.url);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationErrors([]);
    setNameError(null);

    // Include any unfinished text currently typed in the tag input before validating
    const pendingTags = keywordInput
      .split(',')
      .map((item) => item.trim().replace(/^#/, '').slice(0, PUBLISH_LIMITS.MAX_KEYWORD_LENGTH))
      .filter(Boolean);
    const mergedKeywords = [...keywords];
    for (const tag of pendingTags) {
      if (mergedKeywords.length >= PUBLISH_LIMITS.MAX_KEYWORDS) break;
      if (!mergedKeywords.includes(tag)) {
        mergedKeywords.push(tag);
      }
    }
    if (pendingTags.length > 0) {
      setKeywords(mergedKeywords);
      setKeywordInput('');
    }

    const parsed = publishQuizSchema.safeParse({
      name,
      description,
      coverImg,
      keywords: mergedKeywords,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const nameIssue = issues.find((issue) => issue.path[0] === 'name');

      if (nameIssue) {
        setNameError(nameIssue.message);
        nameInputRef.current?.focus();
      } else {
        setValidationErrors(issues.map((issue) => issue.message));
        requestAnimationFrame(() => errorSummaryRef.current?.focus());
      }
      return;
    }

    const questionErrors = validateQuiz({
      ...quiz,
      name: parsed.data.name,
    });

    if (questionErrors.length > 0) {
      setValidationErrors(questionErrors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    const errors = await onSubmitForm({
      name: parsed.data.name,
      description: parsed.data.description || null,
      coverImg: coverImg || null,
      keywords: parsed.data.keywords,
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className={styles.form} noValidate>
      {validationErrors.length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          className={styles.errorSummary}
          role="alert"
        >
          <h3 className={styles.errorSummaryTitle}>
            <WarningIcon size={15} />
            <span>Неможливо опублікувати:</span>
          </h3>
          <ul className={styles.errorSummaryList}>
            {validationErrors.map((errMsg, index) => (
              <li key={index}>{errMsg}</li>
            ))}
          </ul>
        </div>
      )}

      <QuizCoverField
        coverImg={coverImg}
        isUploading={isUploading}
        uploadError={uploadError}
        onUploadFile={handleUploadFile}
        onRemoveCover={() => {
          setUploadError(null);
          setCoverImg(null);
        }}
      />

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="publish-quiz-name" className={styles.label}>
            <span>Назва вікторини</span>
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          </label>
          <span className={styles.charCount}>
            {name.length}/{PUBLISH_LIMITS.MAX_NAME_LENGTH}
          </span>
        </div>
        <input
          ref={nameInputRef}
          id="publish-quiz-name"
          name="name"
          type="text"
          className={`${styles.input} ${nameError ? styles.inputError : ''}`}
          placeholder="Введіть назву вікторини..."
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (nameError && event.target.value.trim()) {
              setNameError(null);
            }
          }}
          maxLength={PUBLISH_LIMITS.MAX_NAME_LENGTH}
          required
          autoFocus
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? nameErrorId : undefined}
        />
        {nameError && (
          <p id={nameErrorId} className={styles.fieldErrorText} role="alert">
            {nameError}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="publish-quiz-desc" className={styles.label}>
            Опис
          </label>
          <span className={styles.charCount}>
            {description.length}/{PUBLISH_LIMITS.MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <textarea
          id="publish-quiz-desc"
          name="description"
          className={styles.textarea}
          placeholder="Коротко розкажіть, про що ця вікторина і для кого вона призначена..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={PUBLISH_LIMITS.MAX_DESCRIPTION_LENGTH}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="publish-quiz-keywords" className={styles.label}>
            Теги (ключові слова)
          </label>
          <span className={styles.labelHint}>
            Enter або кома · {keywords.length}/{PUBLISH_LIMITS.MAX_KEYWORDS}
          </span>
        </div>

        <div
          className={styles.tagsContainer}
          onClick={() => keywordInputRef.current?.focus()}
        >
          {keywords.map((tag, index) => (
            <span key={tag} className={styles.tagPill}>
              <span className={styles.tagLabel}>#{tag}</span>
              <button
                type="button"
                className={styles.tagRemoveBtn}
                onClick={(event) => {
                  event.stopPropagation();
                  setKeywords((prev) => prev.filter((_, idx) => idx !== index));
                }}
                aria-label={`Видалити тег ${tag}`}
              >
                <CloseIcon size={11} />
              </button>
            </span>
          ))}

          {keywords.length < PUBLISH_LIMITS.MAX_KEYWORDS && (
            <input
              ref={keywordInputRef}
              id="publish-quiz-keywords"
              name="keywords"
              type="text"
              className={styles.tagsInput}
              placeholder={
                keywords.length === 0 ? 'наприклад: історія, 9 клас' : 'додати тег...'
              }
              value={keywordInput}
              maxLength={PUBLISH_LIMITS.MAX_KEYWORD_LENGTH}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onPaste={handleKeywordPaste}
              onBlur={commitPendingKeyword}
            />
          )}
        </div>
      </div>
    </form>
  );
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onPublishSuccess,
  onAfterClose,
}) => {
  const formId = useId();

  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [publishQuiz, { isLoading: isPublishing }] = usePublishQuizMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const isSubmitting = isUpdating || isPublishing;

  const handleUploadCoverFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      if (res.data?.url) {
        return { url: res.data.url };
      }
      return { error: 'Сервер не повернув посилання на зображення.' };
    } catch (err) {
      console.error('Failed to upload cover image:', err);
      return { error: 'Помилка при завантаженні зображення. Спробуйте ще раз.' };
    }
  };

  const handleSubmitForm = async (payload: {
    name: string;
    description: string | null;
    coverImg: string | null;
    keywords: string[];
  }): Promise<string[]> => {
    try {
      await updateQuiz({
        id: quiz.id,
        body: payload,
      }).unwrap();

      await publishQuiz(quiz.id).unwrap();
      onPublishSuccess();
      return [];
    } catch (err: unknown) {
      console.error('Publish error:', err);
      return extractPublishErrors(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={onAfterClose}
      isBusy={isSubmitting}
      size="lg"
      title="Публікація вікторини"
      subtitle="Заповніть інформацію, щоб гравці могли легко знайти ваш квіз"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Скасувати
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={isSubmitting || isUploading}
          >
            <PublicIcon width={15} height={15} />
            <span>{isSubmitting ? 'Публікація...' : 'Опублікувати квіз'}</span>
          </Button>
        </>
      }
    >
      <PublishModalForm
        formId={formId}
        quiz={quiz}
        isUploading={isUploading}
        onSubmitForm={handleSubmitForm}
        onUploadCoverFile={handleUploadCoverFile}
      />
    </Modal>
  );
};
