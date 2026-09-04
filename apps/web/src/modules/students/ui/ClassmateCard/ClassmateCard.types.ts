import type { ClassmateSummaryDto } from '@viaquiz/shared-types';

export interface ClassmateCardProps {
  classmate: ClassmateSummaryDto;
  onClick?: (uuid: string) => void;
}
