import { useParams, useNavigate } from 'react-router-dom';
import { useGetQuizForEditorQuery } from '../../../modules/quiz-editor/api/quizEditorApi';
import { QuizEditorLayout } from '../../../modules/quiz-editor/ui/QuizEditorLayout/QuizEditorLayout';
import { useUserContext } from '../../../modules/auth/context';
import './QuizEditorPage.css';

export function QuizEditorPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useGetQuizForEditorQuery(uuid || '', {
    skip: !uuid,
  });

  if (!uuid) {
    return (
      <div className="quiz-editor-error">
        <h2>Невірний ідентифікатор квізу</h2>
        <button onClick={() => navigate('/dashboard')}>Повернутись</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="quiz-editor-loading">
        <div className="quiz-editor-spinner" />
        <span>Завантаження квізу...</span>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="quiz-editor-error">
        <h2>Не вдалося завантажити квіз</h2>
        <p>{(error as { data?: { message?: string } })?.data?.message || 'Невідома помилка'}</p>
        <button onClick={() => navigate('/dashboard')}>Повернутись</button>
      </div>
    );
  }

  // Check ownership
  if (user && quiz.authorId !== Number(user.id)) {
    return (
      <div className="quiz-editor-error">
        <h2>Доступ заборонено</h2>
        <p>Ви не є автором цього квізу.</p>
        <button onClick={() => navigate('/dashboard')}>Повернутись</button>
      </div>
    );
  }

  return <QuizEditorLayout quiz={quiz} />;
}
