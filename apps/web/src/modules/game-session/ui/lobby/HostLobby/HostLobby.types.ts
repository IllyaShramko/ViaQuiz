import type { ParticipantDto } from '@viaquiz/shared-types';

export interface HostLobbyProps {
  joinCode: string;
  roomUuid?: string;
  participants: ParticipantDto[];
  onStartGame: () => void;
  onKickParticipant: (participantId: number) => void;
}
