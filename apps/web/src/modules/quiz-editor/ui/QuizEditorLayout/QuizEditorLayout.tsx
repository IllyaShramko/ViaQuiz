import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorHeader } from '../EditorHeader/EditorHeader';
import { QuestionList } from '../QuestionList/QuestionList';
import { QuestionEditor } from '../QuestionEditor/QuestionEditor';
import { QuestionTypeSelector } from '../QuestionTypeSelector/QuestionTypeSelector';
import { QuestionSettings } from '../QuestionSettings/QuestionSettings';
import { PublishModal } from '../PublishModal/PublishModal';
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useDuplicateQuestionMutation,
  useReorderQuestionsMutation,
  useUpdateQuizMutation,
  usePublishQuizMutation,
} from '../../api/quizEditorApi';
import type { EditorQuiz, EditorQuestion, QuestionType, SaveStatus } from '../../models/types';
import styles from './QuizEditorLayout.module.css';

interface QuizEditorLayoutProps {
  quiz: EditorQuiz;
}

export const QuizEditorLayout: React.FC<QuizEditorLayoutProps> = ({ quiz }) => {
  const [localQuiz, setLocalQuiz] = useState<EditorQuiz>(quiz);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const navigate = useNavigate();

  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [duplicateQuestion] = useDuplicateQuestionMutation();
  const [reorderQuestions] = useReorderQuestionsMutation();
  const [updateQuiz] = useUpdateQuizMutation();
  const [, { isLoading: isPublishing }] = usePublishQuizMutation();

  // Debounce timers
  const nameDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external quiz changes (e.g. from creation/deletion/reorder/initial load)
  useEffect(() => {
    setLocalQuiz((prev) => {
      // If questions count or structure changed on server, sync questions while preserving ongoing edits
      if (
        prev.id !== quiz.id ||
        prev.questions.length !== quiz.questions.length ||
        prev.isDraft !== quiz.isDraft
      ) {
        return quiz;
      }
      return prev;
    });

    // Ensure selected question still exists if one was selected
    setSelectedQuestionId((currentSelected) => {
      if (currentSelected !== null && !quiz.questions.some((q) => q.id === currentSelected)) {
        return null;
      }
      return currentSelected;
    });
  }, [quiz]);

  const markSaved = useCallback(() => {
    setSaveStatus('saved');
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    statusResetTimerRef.current = setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  }, []);

  const handleNameChange = (name: string) => {
    setLocalQuiz((prev) => ({ ...prev, name }));
    setSaveStatus('saving');

    if (nameDebounceTimerRef.current) clearTimeout(nameDebounceTimerRef.current);
    nameDebounceTimerRef.current = setTimeout(async () => {
      try {
        await updateQuiz({ id: localQuiz.id, body: { name } }).unwrap();
        markSaved();
      } catch (err) {
        console.error('Auto-save name failed:', err);
        setSaveStatus('error');
      }
    }, 800);
  };

  const handleQuestionUpdate = (data: Partial<EditorQuestion>) => {
    if (!selectedQuestionId) return;

    let updatedQuestion: EditorQuestion | undefined;

    setLocalQuiz((prev) => {
      const questions = prev.questions.map((q) => {
        if (q.id === selectedQuestionId) {
          updatedQuestion = { ...q, ...data };
          return updatedQuestion;
        }
        return q;
      });
      return { ...prev, questions };
    });

    setSaveStatus('saving');

    if (questionDebounceTimerRef.current) clearTimeout(questionDebounceTimerRef.current);
    questionDebounceTimerRef.current = setTimeout(async () => {
      if (!updatedQuestion) return;
      try {
        await updateQuestion({
          id: selectedQuestionId,
          quizId: localQuiz.id,
          body: {
            text: updatedQuestion.text,
            media: updatedQuestion.media,
            type: updatedQuestion.type,
            timeLimit: updatedQuestion.timeLimit,
            points: updatedQuestion.points,
            variants: updatedQuestion.variants,
          },
        }).unwrap();
        markSaved();
      } catch (err) {
        console.error('Auto-save question failed:', err);
        setSaveStatus('error');
      }
    }, 800);
  };

  const handleOpenPublishModal = async () => {
    // Flush any pending auto-saves before opening publish modal
    if (nameDebounceTimerRef.current) {
      clearTimeout(nameDebounceTimerRef.current);
      nameDebounceTimerRef.current = null;
      try {
        await updateQuiz({ id: localQuiz.id, body: { name: localQuiz.name } }).unwrap();
      } catch (err) {
        console.error('Failed to save quiz name before publish:', err);
      }
    }

    const currentQ = localQuiz.questions.find((q) => q.id === selectedQuestionId);
    if (questionDebounceTimerRef.current && currentQ && selectedQuestionId) {
      clearTimeout(questionDebounceTimerRef.current);
      questionDebounceTimerRef.current = null;
      try {
        await updateQuestion({
          id: selectedQuestionId,
          quizId: localQuiz.id,
          body: {
            text: currentQ.text,
            media: currentQ.media,
            type: currentQ.type,
            timeLimit: currentQ.timeLimit,
            points: currentQ.points,
            variants: currentQ.variants,
          },
        }).unwrap();
      } catch (err) {
        console.error('Failed to save question before publish:', err);
      }
    }

    setIsPublishModalOpen(true);
  };

  const handlePublishSuccess = () => {
    setIsPublishModalOpen(false);
    navigate(`/quiz/${localQuiz.uuid}`);
  };

  const handleBack = () => {
    navigate('/quiz/drafts');
  };

  const handleAddQuestionType = async (type: QuestionType) => {
    try {
      const res = await createQuestion({ quizId: localQuiz.id, body: { type } }).unwrap();
      setLocalQuiz((prev) => ({
        ...prev,
        questions: [...prev.questions, res],
      }));
      setSelectedQuestionId(res.id);
    } catch (err) {
      console.error('Create question failed:', err);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    try {
      await deleteQuestion(id).unwrap();
      setLocalQuiz((prev) => {
        const remaining = prev.questions.filter((q) => q.id !== id);
        return { ...prev, questions: remaining };
      });
      if (selectedQuestionId === id) {
        const remaining = localQuiz.questions.filter((q) => q.id !== id);
        setSelectedQuestionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Delete question failed:', err);
    }
  };

  const handleDuplicateQuestion = async (id: number) => {
    try {
      const res = await duplicateQuestion(id).unwrap();
      setLocalQuiz((prev) => ({
        ...prev,
        questions: [...prev.questions, res],
      }));
      setSelectedQuestionId(res.id);
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleReorder = async (questionIds: number[]) => {
    // Reorder local state immediately for seamless UI
    setLocalQuiz((prev) => {
      const questionMap = new Map(prev.questions.map((q) => [q.id, q]));
      const reordered = questionIds
        .map((id) => questionMap.get(id))
        .filter((q): q is EditorQuestion => q !== undefined);
      return { ...prev, questions: reordered };
    });

    try {
      await reorderQuestions({ quizId: localQuiz.id, body: { questionIds } }).unwrap();
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  const handleSaveQuestion = async () => {
    const currentQ = localQuiz.questions.find((q) => q.id === selectedQuestionId);
    if (questionDebounceTimerRef.current && currentQ && selectedQuestionId) {
      clearTimeout(questionDebounceTimerRef.current);
      try {
        await updateQuestion({
          id: selectedQuestionId,
          quizId: localQuiz.id,
          body: {
            text: currentQ.text,
            media: currentQ.media,
            type: currentQ.type,
            timeLimit: currentQ.timeLimit,
            points: currentQ.points,
            variants: currentQ.variants,
          },
        }).unwrap();
        markSaved();
      } catch (err) {
        console.error('Save question failed:', err);
      }
    }
    setSelectedQuestionId(null);
  };

  const selectedQuestion = localQuiz.questions.find((q) => q.id === selectedQuestionId);
  const hasQuestions = localQuiz.questions.length > 0;

  return (
    <div className={styles['quiz-editor-layout']}>
      <EditorHeader
        quizName={localQuiz.name}
        saveStatus={saveStatus}
        onNameChange={handleNameChange}
        onPublish={handleOpenPublishModal}
        onBack={handleBack}
        isPublishing={isPublishing}
        isDraft={localQuiz.isDraft}
        hasQuestions={hasQuestions}
      />

      <div className={styles['quiz-editor-body']}>
        <QuestionList
          questions={localQuiz.questions}
          selectedId={selectedQuestionId}
          onSelect={setSelectedQuestionId}
          onAdd={() => setSelectedQuestionId(null)}
          onDelete={handleDeleteQuestion}
          onDuplicate={handleDuplicateQuestion}
          onReorder={handleReorder}
        />

        <main className={styles['quiz-editor-main']}>
          {!selectedQuestionId || !selectedQuestion ? (
            <QuestionTypeSelector onSelect={handleAddQuestionType} />
          ) : (
            <QuestionEditor
              question={selectedQuestion}
              onUpdate={handleQuestionUpdate}
              onSave={handleSaveQuestion}
            />
          )}
        </main>

        {selectedQuestionId && selectedQuestion && (
          <QuestionSettings
            question={selectedQuestion}
            onUpdate={handleQuestionUpdate}
            onSave={handleSaveQuestion}
          />
        )}
      </div>

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        quiz={localQuiz}
        onPublishSuccess={handlePublishSuccess}
      />
    </div>
  );
};
