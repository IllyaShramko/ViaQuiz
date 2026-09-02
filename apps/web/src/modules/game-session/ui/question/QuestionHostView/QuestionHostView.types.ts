import type { GameQuestionDto, ParticipantDto } from '@viaquiz/shared-types';

export interface QuestionHostViewProps {
  question: GameQuestionDto;
  questionIndex: number;
  totalQuestions: number;
  participants: ParticipantDto[];
  answeredCount: number;
  answeredParticipantIds: Set<number>;
  remainingSeconds: number;
  onExtendTime: (seconds?: number) => void;
  onSkipQuestion: () => void;
  onKickParticipant: (participantId: number) => void;
}
