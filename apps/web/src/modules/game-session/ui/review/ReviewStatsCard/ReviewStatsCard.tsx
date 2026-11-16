import Chart from 'react-apexcharts';
import correctIcon from '../../../../../assets/icons/correct_answers.svg';
import wrongIcon from '../../../../../assets/icons/wrong_answers.svg';
import skippedIcon from '../../../../../assets/icons/skipped_answers.svg';
import type { ReviewStatsCardProps } from './ReviewStatsCard.types';
import styles from './ReviewStatsCard.module.css';

interface ReviewCounts {
	correctCount: number;
	wrongCount: number;
	skippedCount: number;
	totalParticipants: number;
	accuracyPct: number;
}

function calculateReviewCounts({
	correctVariantIds,
	answersDistribution,
	participantAnswers,
	totalParticipantsCount,
}: ReviewStatsCardProps): ReviewCounts {
	const totalParticipants = totalParticipantsCount || 1;
	let correctCount = 0;
	let wrongCount = 0;
	let skippedCount = 0;
	let totalAnswered = 0;

	if (participantAnswers && participantAnswers.length > 0) {
		for (const pa of participantAnswers) {
			if (!pa.isAnswered) {
				skippedCount++;
			} else if (pa.isCorrect) {
				correctCount++;
			} else {
				wrongCount++;
			}
		}
	} else {
		for (const [variantIdStr, count] of Object.entries(answersDistribution || {})) {
			const variantId = Number(variantIdStr);
			totalAnswered += count;
			if (correctVariantIds.includes(variantId)) {
				correctCount += count;
			}
		}
		wrongCount = Math.max(0, totalAnswered - correctCount);
		skippedCount = Math.max(0, totalParticipants - totalAnswered);
	}

	const accuracyPct =
		totalParticipants > 0 ? Math.round((correctCount / totalParticipants) * 100) : 0;

	return {
		correctCount,
		wrongCount,
		skippedCount,
		totalParticipants,
		accuracyPct,
	};
}

/**
 * Displays question answer accuracy donut chart and answer outcome breakdown.
 */
export function ReviewStatsCard(props: ReviewStatsCardProps) {
	const { correctCount, wrongCount, skippedCount, totalParticipants, accuracyPct } =
		calculateReviewCounts(props);

	const donutOptions: ApexCharts.ApexOptions = {
		series: [correctCount, wrongCount, skippedCount],
		chart: {
			type: 'donut',
			height: 280,
			animations: { enabled: true },
		},
		colors: ['#22CE00', '#F03C39', '#585858'],
		labels: ['Правильно', 'Не правильно', 'Пропущено'],
		legend: {
			show: false,
		},
		dataLabels: {
			enabled: false,
		},
		plotOptions: {
			pie: {
				expandOnClick: false,
				donut: {
					size: '70%',
					labels: {
						show: false,
					},
				},
				customScale: 1,
				dataLabels: { minAngleToShowLabel: 10 },
			},
		},
		stroke: {
			show: true,
			width: 5,
			colors: ['#2B2B2B'],
		},
	};

	const statRows = [
		{ key: 'correct', icon: correctIcon, label: 'Правильно', count: correctCount },
		{ key: 'wrong', icon: wrongIcon, label: 'Неправильно', count: wrongCount },
		{ key: 'skipped', icon: skippedIcon, label: 'Пропущено', count: skippedCount },
	] as const;

	return (
		<div className={styles.card}>
			<div className={styles.donutWrapper}>
				<Chart
					options={donutOptions}
					series={donutOptions.series as number[]}
					type="donut"
					height={280}
				/>
				<div className={styles.donutPercentage}>{accuracyPct}%</div>
			</div>

			<div className={styles.statsList}>
				{statRows.map((row) => (
					<div key={row.key} className={styles.statRow}>
						<img src={row.icon} alt={row.label} className={styles.statIcon} />
						<span>
							{row.label}: {row.count}/{totalParticipants}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
