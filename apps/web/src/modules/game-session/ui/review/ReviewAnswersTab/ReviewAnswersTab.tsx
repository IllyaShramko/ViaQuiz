import { StudentAnswerCard, type StudentAnswerItem } from '../StudentAnswerCard';
import type { ReviewAnswersTabProps } from './ReviewAnswersTab.types';
import styles from './ReviewAnswersTab.module.css';

/**
 * Displays per-participant answer cards for the current question review.
 */
export function ReviewAnswersTab({
	participants,
	participantAnswers,
	variants,
	correctVariantIds,
}: ReviewAnswersTabProps) {
	if (participants.length === 0) {
		return (
			<div className={styles.tabContent}>
				<h3 className={styles.emptyText}>Немає учасників у сесії...</h3>
			</div>
		);
	}

	const answerByParticipantId = new Map(
		(participantAnswers ?? []).map((item) => [item.participantId, item]),
	);

	const answeredStudents: StudentAnswerItem[] = [];
	for (const participant of participants) {
		const pa = answerByParticipantId.get(participant.participantId);
		if (!pa?.isAnswered) continue;

		answeredStudents.push({
			participantId: participant.participantId,
			nickname: participant.nickname,
			totalScore: pa.totalScore !== undefined ? pa.totalScore : participant.score,
			isAnswered: true,
			variantIds: pa.variantIds || [],
			typedAnswer: pa.typedAnswer,
			timeSpentMs: pa.timeSpentMs,
			isCorrect: pa.isCorrect,
			scoreEarned: pa.scoreEarned,
		});
	}

	if (answeredStudents.length === 0) {
		return (
			<div className={styles.tabContent}>
				<h3 className={styles.emptyText}>Немає відповідей на це запитання...</h3>
			</div>
		);
	}

	return (
		<div className={styles.tabContent}>
			<div className={styles.grid}>
				{answeredStudents.map((student, idx) => (
					<StudentAnswerCard
						key={student.participantId}
						student={student}
						variants={variants}
						correctVariantIds={correctVariantIds}
						animationDelaySec={Math.min(idx * 0.03, 0.3)}
					/>
				))}
			</div>
		</div>
	);
}
