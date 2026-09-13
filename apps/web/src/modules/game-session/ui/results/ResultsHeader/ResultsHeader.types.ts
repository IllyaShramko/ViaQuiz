export interface ResultsHeaderProps {
	/** Title of the quiz */
	quizName: string;
	/** Total questions count in this quiz */
	totalQuestions: number;
	/** Number of participants who took part */
	participantCount: number;
	/** Optional room UUID for navigating to full report */
	roomUuid?: string;
}
