import type { RoomStatus } from '@viaquiz/shared-types';

export interface HostControlsBarProps {
  status: Extract<RoomStatus, 'PROGRESS' | 'REVIEWING'>;
  remainingSeconds: number;
  answeredCount: number;
  totalParticipants: number;
  isLastQuestion?: boolean;
  onExtendTime?: (seconds?: number) => void;
  onPrimaryAction: () => void;
}
