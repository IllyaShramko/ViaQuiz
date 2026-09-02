import type { ParticipantDto } from '@viaquiz/shared-types';

export interface StudentLobbyProps {
  quizName?: string;
  teacherName?: string;
  totalQuestions: number;
  participants: ParticipantDto[];
}
