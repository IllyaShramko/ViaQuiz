import type { ParticipantDto } from '@viaquiz/shared-types';

export interface FinalResultsHostProps {
  quizName?: string;
  totalQuestions: number;
  leaderboard: ParticipantDto[];
  roomUuid?: string;
}
