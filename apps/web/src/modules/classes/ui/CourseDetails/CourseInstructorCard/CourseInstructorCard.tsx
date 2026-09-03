import { useCancelInvitationMutation } from '../../../api/classesApi';
import type { CourseInstructorCardProps } from './CourseInstructorCard.types';
import styles from './CourseInstructorCard.module.css';

export function CourseInstructorCard({
  course,
  classUuid,
  isCreator,
  onOpenInviteModal,
}: CourseInstructorCardProps) {
  const [cancelInvitation, { isLoading: isCanceling }] = useCancelInvitationMutation();

  const isDelegatedTeacher =
    course.teacher && course.creator && course.teacher.id !== course.creator.id;

  const currentTeacher = isDelegatedTeacher ? course.teacher : course.creator;

  const teacherDisplayName = currentTeacher
    ? currentTeacher.firstName && currentTeacher.lastName
      ? `${currentTeacher.firstName} ${currentTeacher.lastName}`
      : `@${currentTeacher.login}`
    : 'Не призначено';

  const curatorDisplayName = course.creator
    ? course.creator.firstName && course.creator.lastName
      ? `${course.creator.firstName} ${course.creator.lastName}`
      : course.creator.firstName || course.creator.lastName || `@${course.creator.login}`
    : '';

  const pendingInvitation = course.invitations?.find((i) => i.status === 'PENDING');

  const handleCancelInvite = async (inviteUuid: string) => {
    try {
      await cancelInvitation({
        classUuid,
        courseUuid: course.uuid,
        inviteUuid,
      }).unwrap();
    } catch {
      // Ignored
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h4 className={styles.title}>Керівництво курсом</h4>
            <p className={styles.subtitle}>
              {isDelegatedTeacher
                ? `Курс веде призначений викладач (Куратор: ${curatorDisplayName})`
                : 'Курс веде куратор класу'}
            </p>
          </div>
        </div>

        {isCreator && (
          <button
            type="button"
            className={styles.inviteButton}
            onClick={onOpenInviteModal}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>{isDelegatedTeacher ? 'Змінити викладача' : 'Призначити викладача'}</span>
          </button>
        )}
      </div>

      <div className={styles.teacherInfo}>
        <div className={styles.teacherProfile}>
          <div className={styles.avatar}>
            {teacherDisplayName.charAt(0)}
          </div>
          <div className={styles.nameGroup}>
            <span className={styles.teacherName}>{teacherDisplayName}</span>
            {currentTeacher?.login && (
              <span className={styles.teacherLogin}>@{currentTeacher.login}</span>
            )}
          </div>
        </div>

        <span
          className={`${styles.roleBadge} ${
            !isDelegatedTeacher ? styles.roleBadgeCurator : ''
          }`}
        >
          {isDelegatedTeacher ? 'Ведучий викладач' : 'Куратор курсу'}
        </span>
      </div>

      {pendingInvitation && (
        <div className={styles.pendingBox}>
          <div className={styles.pendingText}>
            <span>⏳</span>
            <span>
              Очікує підтвердження від:{' '}
              <strong>
                {pendingInvitation.invitedLogin
                  ? `@${pendingInvitation.invitedLogin}`
                  : pendingInvitation.invitedEmail}
              </strong>
            </span>
          </div>

          {isCreator && (
            <button
              type="button"
              className={styles.cancelInviteBtn}
              onClick={() => handleCancelInvite(pendingInvitation.uuid)}
              disabled={isCanceling}
            >
              {isCanceling ? 'Скасування...' : 'Скасувати'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
