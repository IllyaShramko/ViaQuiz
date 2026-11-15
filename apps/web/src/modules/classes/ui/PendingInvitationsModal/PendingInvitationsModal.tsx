import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '../../../../shared';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Вхідні запрошення на курси"
      isBusy={processingToken !== null}
      bodyClassName={styles.list}
    >
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
                <h3 className={styles.courseName}>{inv.course?.name || 'Курс'}</h3>
                <div className={styles.classInfo}>
                  Клас: {inv.course?.classroom?.name || 'Без класу'}
                </div>
              </div>

              <p className={styles.inviterInfo}>
                Куратор <strong>{inviterName}</strong> запрошує вас очолити цей курс.
              </p>

              <div className={styles.actions}>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => void handleReject(inv.token)}
                >
                  Відхилити
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isBusy}
                  onClick={() => void handleAccept(inv.token)}
                >
                  {isBusy ? 'Обробка...' : 'Прийняти керівництво'}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </Modal>
  );
}
