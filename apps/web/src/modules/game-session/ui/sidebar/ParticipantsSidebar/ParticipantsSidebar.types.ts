import type {
  ParticipantDto,
  GameReviewDataDto,
  RoomStatus,
} from '@viaquiz/shared-types';

export interface ParticipantsSidebarProps {
  participants: ParticipantDto[];
  status: RoomStatus;
  answeredParticipantIds?: Set<number>;
  reviewData?: GameReviewDataDto | null;
  onKickParticipant?: (participantId: number) => void;
}
