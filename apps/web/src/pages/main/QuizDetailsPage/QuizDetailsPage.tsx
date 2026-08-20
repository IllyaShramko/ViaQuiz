import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetQuizByUuidQuery,
  useRecordViewMutation,
  QuizBackButton,
  QuizDetailsHero,
  QuizQuestionsList,
  QuizDetailsSkeleton,
  QuizDetailsError,
} from '../../../modules/quiz-details';
import styles from '../../../modules/quiz-details/ui/QuizDetails.module.css';

export function QuizDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [recordView] = useRecordViewMutation();

  useEffect(() => {
    if (uuid) {
      recordView(uuid).unwrap().catch(() => {});
    }
  }, [uuid, recordView]);

  const {
    data: quiz,
    isLoading,
    isError,
    refetch,
  } = useGetQuizByUuidQuery(uuid || '', {
    skip: !uuid,
  });

  if (isLoading) {
    return (
      <div className={styles['quiz-details-page']}>
        <QuizDetailsSkeleton />
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className={styles['quiz-details-page']}>
        <QuizDetailsError
          onGoHome={() => navigate('/dashboard')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={styles['quiz-details-page']}>
      <QuizBackButton onBack={() => navigate('/dashboard')} />
      <QuizDetailsHero quiz={quiz} />
      <QuizQuestionsList questions={quiz.questions || []} />
    </div>
  );
}
