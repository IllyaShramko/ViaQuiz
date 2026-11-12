import type { FormEvent } from 'react';
import type { ClassroomPerformanceDto } from '@viaquiz/shared-types';

export type PerformancePeriodPreset = '7d' | '30d' | 'all' | 'custom';

export interface PerformanceDateRange {
  from?: string;
  to?: string;
}

export interface PerformanceOverviewProps {
  classUuid: string;
  data?: ClassroomPerformanceDto | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  emptyStudentsText?: string;
  preset: PerformancePeriodPreset;
  customFrom: string;
  customTo: string;
  appliedRange: PerformanceDateRange;
  isCustomInvalid: boolean;
  onSelectPreset: (preset: PerformancePeriodPreset) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onApplyCustom: (event: FormEvent) => void;
}
