import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetQuizByUuidQuery,
  useRecordViewMutation,
  QuizDetailsHero,
  QuizLaunchCard,
  QuizQuestionsList,
  QuizDetailsSkeleton,
  QuizDetailsError,
} from '../../../modules/quiz-details';
import { useTeacherHeader } from '../../../shared';
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

  useTeacherHeader(
    {
      title: quiz?.name || 'Вікторина',
      showBack: true,
      backTo: '/dashboard',
      backLabel: 'Назад до головної',
    },
    [quiz?.name],
  );

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
      <QuizDetailsHero quiz={quiz} />
      <QuizLaunchCard quiz={quiz} />
      <hr className={styles['quiz-details-divider']} />
      <QuizQuestionsList questions={quiz.questions || []} />
    </div>
  );
}


