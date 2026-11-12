import { useCancelInvitationMutation } from '../../../api/classesApi';
import { HourglassIcon } from '../../../../../shared';
import type { CourseInstructorCardProps } from './CourseInstructorCard.types';
import styles from './CourseInstructorCard.module.css';

export function CourseInstructorCard({
  course,
  classUuid,
  isCreator,
  onOpenInviteModal,
}: CourseInstructorCardProps) {
  const [cancelInvitation, { isLoading: isCanceling }] = useCancelInvitationMutation();

  const isDelegatedTeacher = Boolean(
    course.teacher && course.creator && course.teacher.id !== course.creator.id,
  );

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

  const avatarLetter = teacherDisplayName.replace(/^@/, '').charAt(0) || '?';

  return (
    <div className={styles.bar}>
      <div className={styles.mainRow}>
        <div className={styles.teacherInfo}>
          <span className={styles.avatar} aria-hidden="true">
            {avatarLetter}
          </span>
          <span className={styles.label}>Викладач:</span>
          <span className={styles.teacherName}>{teacherDisplayName}</span>
          {currentTeacher?.login && (
            <span className={styles.teacherLogin}>@{currentTeacher.login}</span>
          )}
          <span
            className={`${styles.roleTag} ${
              isDelegatedTeacher ? styles.roleTagDelegated : ''
            }`}
          >
            {isDelegatedTeacher ? 'Ведучий викладач' : 'Куратор курсу'}
          </span>
          {isDelegatedTeacher && curatorDisplayName && (
            <span className={styles.curatorHint}>Куратор класу: {curatorDisplayName}</span>
          )}
        </div>

        {isCreator && (
          <button
            type="button"
            className={styles.inviteButton}
            onClick={onOpenInviteModal}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>{isDelegatedTeacher ? 'Змінити викладача' : 'Призначити викладача'}</span>
          </button>
        )}
      </div>

      {pendingInvitation && (
        <div className={styles.pendingRow}>
          <div className={styles.pendingText}>
            <HourglassIcon size={14} />
            <span>
              Очікує підтвердження від{' '}
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
