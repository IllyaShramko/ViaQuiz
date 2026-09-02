import type { PublicQuizSummary } from '../../models';

export interface TeacherQuizCardProps {
  quiz: PublicQuizSummary;
  index?: number;
  onClick: (uuid: string) => void;
}
