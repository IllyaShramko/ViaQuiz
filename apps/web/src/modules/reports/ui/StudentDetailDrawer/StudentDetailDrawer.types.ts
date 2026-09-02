export interface StudentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomUuid: string;
  participantId: number | null;
}
