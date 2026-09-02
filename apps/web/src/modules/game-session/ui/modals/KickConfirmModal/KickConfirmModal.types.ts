export interface KickConfirmModalProps {
  isOpen: boolean;
  participantName: string;
  onConfirm: () => void;
  onCancel: () => void;
}
