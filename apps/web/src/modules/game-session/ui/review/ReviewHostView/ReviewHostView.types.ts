import type {
  GameQuestionDto,
  GameReviewDataDto,
  ParticipantDto,
} from '@viaquiz/shared-types';

export interface ReviewHostViewProps {
  question: GameQuestionDto;
  reviewData: GameReviewDataDto;
  participants: ParticipantDto[];
  remainingSeconds: number;
  onExtendTime?: (secs?: number) => void;
  onNextQuestion: () => void;
  onKickParticipant?: (participantId: number) => void;
}
