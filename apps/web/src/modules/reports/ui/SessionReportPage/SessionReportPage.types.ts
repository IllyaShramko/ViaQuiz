import type { SessionParticipantSummaryDto } from '@viaquiz/shared-types';

export type SessionReportTab = 'overview' | 'questions' | 'chart';

export type ReportSortBy = 'percentage' | 'grade' | 'name';

export interface OverviewTabProps {
	participants: SessionParticipantSummaryDto[];
	onRowClick: (id: number) => void;
}
