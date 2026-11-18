import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../modules/auth';
import {
  QuizDetailsError,
  QuizDetailsHero,
  QuizDetailsSkeleton,
  QuizLaunchCard,
  QuizQuestionsList,
  useGetQuizByUuidQuery,
  useRecordViewMutation,
} from '../../../modules/quiz-details';
import { CloseIcon, Modal, useTeacherHeader } from '../../../shared';
import styles from './QuizDetailsPage.module.css';

interface PreviewImageState {
  src: string;
  alt: string;
}

export function QuizDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);

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
      <div className={styles.container}>
        <QuizDetailsSkeleton />
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className={styles.container}>
        <QuizDetailsError
          onGoHome={() => navigate('/dashboard')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isOwner = Boolean(user?.id && quiz.authorId === user.id);

  return (
    <div className={styles.container}>
      <QuizDetailsHero
        key={quiz.uuid}
        quiz={quiz}
        isOwner={isOwner}
        onPreviewImage={setPreviewImage}
      />

      <QuizLaunchCard key={`launch-${quiz.uuid}`} quiz={quiz} />

      <QuizQuestionsList
        key={`questions-${quiz.uuid}`}
        questions={quiz.questions || []}
        onPreviewImage={setPreviewImage}
      />

      <Modal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        size="unstyled"
        ariaLabel={previewImage?.alt || 'Перегляд зображення'}
      >
        {previewImage && (
          <div className={styles.lightboxContent}>
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className={styles.lightboxImg}
            />
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setPreviewImage(null)}
              aria-label="Закрити зображення"
            >
              <CloseIcon size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
