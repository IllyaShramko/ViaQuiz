import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ChevronDownIcon, PlayIcon } from '../../../../shared';
import { useGetClassroomsQuery } from '../../../classes/api/classesApi';
import { useCreateRoomMutation } from '../../../game-session/api/gameSessionApi';
import type { QuizLaunchCardProps } from './QuizLaunchCard.types';
import styles from './QuizLaunchCard.module.css';

export function QuizLaunchCard({ quiz }: QuizLaunchCardProps) {
  const navigate = useNavigate();
  const selectId = useId();

  const { data: classroomsData, isLoading: isClassroomsLoading } =
    useGetClassroomsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classrooms = classroomsData?.classrooms || [];
  const questionsCount = quiz.questions?.length ?? quiz._count?.questions ?? 0;
  const hasQuestions = questionsCount > 0;

  const handleStartQuiz = async () => {
    if (!hasQuestions || isCreating) return;
    setError(null);

    try {
      const room = await createRoom({
        quizId: quiz.id,
        courseId: selectedCourseId,
      }).unwrap();

      navigate(`/game/host/${room.uuid}`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e.data?.message || 'Не вдалося розпочати вікторину');
    }
  };

  return (
    <section className={styles.launchBar} aria-label="Запуск живої сесії">
      <div className={styles.mainRow}>
        <div className={styles.info}>
          <h3 className={styles.title}>Провести вікторину в реальному часі</h3>
          <p className={styles.subtitle}>
            {hasQuestions
              ? 'Кімната з 6-значним PIN-кодом для вільного входу або конкретного курсу'
              : 'Додайте хоча б одне запитання, щоб запустити кімнату'}
          </p>
        </div>

        <div className={styles.controls}>
          <label htmlFor={selectId} className={styles.srOnly}>
            Клас або курс для запуску вікторини
          </label>
          <div className={styles.selectWrapper}>
            <select
              id={selectId}
              className={styles.select}
              value={selectedCourseId ?? ''}
              disabled={isClassroomsLoading || isCreating || !hasQuestions}
              onChange={(e) =>
                setSelectedCourseId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Без класу (для всіх)</option>
              {classrooms.map((cls) => {
                const courses = cls.courses || [];
                if (courses.length === 0) {
                  return (
                    <optgroup key={cls.id} label={`Клас: ${cls.name}`}>
                      <option disabled value="">
                        (Немає курсів у класі)
                      </option>
                    </optgroup>
                  );
                }
                return (
                  <optgroup key={cls.id} label={`Клас: ${cls.name}`}>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <ChevronDownIcon size={15} className={styles.selectChevron} aria-hidden="true" />
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={isCreating || !hasQuestions}
            onClick={handleStartQuiz}
            title={!hasQuestions ? 'Додайте запитання перед запуском' : undefined}
          >
            <PlayIcon size={13} aria-hidden="true" />
            <span>{isCreating ? 'Створення...' : 'Почати вікторину'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
