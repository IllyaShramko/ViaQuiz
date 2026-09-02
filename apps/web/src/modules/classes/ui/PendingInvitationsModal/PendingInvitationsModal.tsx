import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAcceptInvitationMutation,
  useGetMyPendingInvitationsQuery,
  useRejectInvitationMutation,
} from '../../api/classesApi';
import type { PendingInvitationsModalProps } from './PendingInvitationsModal.types';
import styles from './PendingInvitationsModal.module.css';

export function PendingInvitationsModal({
  isOpen,
  onClose,
}: PendingInvitationsModalProps) {
  const navigate = useNavigate();
  const { data: invitations = [], isLoading } = useGetMyPendingInvitationsQuery(
    undefined,
    { skip: !isOpen },
  );

  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();
  const [processingToken, setProcessingToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccept = async (token: string) => {
    setProcessingToken(token);
    try {
      const res = await acceptInvitation(token).unwrap();
      onClose();
      if (res.course?.classUuid && res.course?.uuid) {
        navigate(`/classes/${res.course.classUuid}/courses/${res.course.uuid}`);
      }
    } catch {
      // Ignored
    } finally {
      setProcessingToken(null);
    }
  };

  const handleReject = async (token: string) => {
    setProcessingToken(token);
    try {
      await rejectInvitation(token).unwrap();
      if (invitations.length <= 1) {
        onClose();
      }
    } catch {
      // Ignored
    } finally {
      setProcessingToken(null);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Вхідні запрошення на курси</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.emptyState}>Завантаження запрошень...</div>
          ) : invitations.length === 0 ? (
            <div className={styles.emptyState}>У вас немає активних запрошень</div>
          ) : (
            invitations.map((inv) => {
              const inviterName =
                inv.sender?.firstName && inv.sender?.lastName
                  ? `${inv.sender.firstName} ${inv.sender.lastName}`
                  : `@${inv.sender?.login || 'куратор'}`;

              const isBusy =
                (isAccepting || isRejecting) && processingToken === inv.token;

              return (
                <div key={inv.uuid} className={styles.inviteCard}>
                  <div className={styles.inviteHeader}>
                    <div>
                      <h3 className={styles.courseName}>{inv.course?.name || 'Курс'}</h3>
                      <div className={styles.classInfo}>
                        Клас: {inv.course?.classroom?.name || 'Без класу'}
                      </div>
                    </div>
                  </div>

                  <p className={styles.inviterInfo}>
                    Куратор <strong>{inviterName}</strong> запрошує вас очолити цей курс.
                  </p>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.rejectBtn}
                      disabled={isBusy}
                      onClick={() => handleReject(inv.token)}
                    >
                      Відхилити
                    </button>
                    <button
                      type="button"
                      className={styles.acceptBtn}
                      disabled={isBusy}
                      onClick={() => handleAccept(inv.token)}
                    >
                      {isBusy ? 'Обробка...' : 'Прийняти керівництво'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
