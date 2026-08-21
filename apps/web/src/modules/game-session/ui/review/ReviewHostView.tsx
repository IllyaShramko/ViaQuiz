import { useState } from 'react';
import Chart from 'react-apexcharts';
import type {
	GameQuestionDto,
	GameReviewDataDto,
	ParticipantDto,
} from '@viaquiz/shared-types';
import correctIcon from '../../../../assets/icons/correct_answers.svg';
import wrongIcon from '../../../../assets/icons/wrong_answers.svg';
import skippedIcon from '../../../../assets/icons/skipped_answers.svg';
import nextIcon from '../../../../assets/icons/next.svg';
import timerIcon from '../../../../assets/icons/timer.svg';
import styles from '../GameSession.module.css';

export interface ReviewHostViewProps {
	question: GameQuestionDto;
	reviewData: GameReviewDataDto;
	participants: ParticipantDto[];
	remainingSeconds: number;
	onExtendTime: (seconds?: number) => void;
	onNextQuestion: () => void;
}

export function ReviewHostView({
	question,
	reviewData,
	participants,
	remainingSeconds,
	onExtendTime,
	onNextQuestion,
}: ReviewHostViewProps) {
	const [activeTab, setActiveTab] = useState<'overview' | 'answers'>('overview');

	const distribution = reviewData.answersDistribution || {};
	const totalParticipants = participants.length || 1;

	// Calculate counts
	const correctIds = reviewData.correctVariantIds;
	let correctCount = 0;
	let totalAnswered = 0;

	for (const [vIdStr, count] of Object.entries(distribution)) {
		const vId = Number(vIdStr);
		totalAnswered += count;
		if (correctIds.includes(vId)) {
			correctCount += count;
		}
	}

	const wrongCount = Math.max(0, totalAnswered - correctCount);
	const skippedCount = Math.max(0, totalParticipants - totalAnswered);
	const accuracyPct =
		totalParticipants > 0 ? Math.round((correctCount / totalParticipants) * 100) : 0;

	// Donut Chart options (matching old GPTQuiz design)
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

	// Helper to get the text for answer count
	const getAnswerText = (n: number): string => {
		if (n === 0) return `${n} відповідей`;
		const lastDigit = n % 10;
		const lastTwoDigits = n % 100;
		if (lastDigit === 1 && lastTwoDigits !== 11) {
			return `${n} відповідь`;
		} else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
			return `${n} відповіді`;
		} else {
			return `${n} відповідей`;
		}
	};

	return (
		<div className={styles['game-layout-body']}>
			<div className={styles['game-main-content']}>
				<div className={styles['teacher-review-container']}>
					{/* Left Column: Donut Chart & Stats */}
					<div className={styles['review-stats-card']}>
						<div className={styles['review-donut-wrapper']}>
							<Chart
								options={donutOptions}
								series={donutOptions.series as number[]}
								type="donut"
								height={280}
							/>
							<div className={styles['review-donut-percentage']}>
								{accuracyPct}%
							</div>
						</div>

						<div className={styles['review-stats-list']}>
							<div className={styles['review-stat-row']}>
								<img src={correctIcon} alt="Правильно" className={styles['review-stat-icon']} />
								<span>
									Правильно: {correctCount}/{totalParticipants}
								</span>
							</div>
							<div className={styles['review-stat-row']}>
								<img src={wrongIcon} alt="Неправильно" className={styles['review-stat-icon']} />
								<span>
									Неправильно: {wrongCount}/{totalParticipants}
								</span>
							</div>
							<div className={styles['review-stat-row']}>
								<img src={skippedIcon} alt="Пропущено" className={styles['review-stat-icon']} />
								<span>
									Пропущено: {skippedCount}/{totalParticipants}
								</span>
							</div>
						</div>
					</div>

					{/* Right Column: Tabs (Overview & Individual Answers) */}
					<div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
						<div className={styles['review-tabs-header']}>
							<button
								type="button"
								className={`${styles['review-tab-btn']} ${
									activeTab === 'overview' ? styles['is-active'] : ''
								}`}
								onClick={() => setActiveTab('overview')}
							>
								Загальний огляд
							</button>
							<button
								type="button"
								className={`${styles['review-tab-btn']} ${
									activeTab === 'answers' ? styles['is-active'] : ''
								}`}
								onClick={() => setActiveTab('answers')}
							>
								Відповідді
							</button>
						</div>

						{/* Tab 1: General Overview */}
						{activeTab === 'overview' && (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
								<h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
									{question.text}
								</h3>

								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{question.variants.map((v, idx) => {
										const count = distribution[v.id] || 0;
										const isCorrect = correctIds.includes(v.id);

										return (
											<div
												key={v.id}
												className={styles['teacher-review-variant-row']}
												style={{
													borderColor: isCorrect ? 'var(--color-success, #22c55e)' : undefined,
												}}
											>
												<div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
													<div className={styles['variant-badge-corner']} style={{ position: 'static' }}>{idx + 1}</div>
													<span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>
														{v.text || 'Варіант без тексту'}
														{isCorrect && (
															<span
																style={{
																	color: 'var(--color-success, #22c55e)',
																	fontSize: '0.85rem',
																	marginLeft: '0.5rem',
																}}
															>
																(Правильний)
															</span>
														)}
													</span>
												</div>

												<span
													className={`${styles['teacher-variant-badge-count']} ${
														count > 0 ? styles['has-answers'] : ''
													}`}
												>
													{getAnswerText(count)}
												</span>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Tab 2: Individual Answers (only show participants who answered) */}
						{activeTab === 'answers' && (
							<div>
								{(() => {
									// Build list of participants who answered
									// Since the host doesn't receive individual answer data from the backend,
									// we show participants with score > 0 or participants who have answered
									const answeredParticipants = participants.filter(p => {
										return totalAnswered > 0 && p.score > 0;
									});

									// If no answers at all, show the placeholder
									if (totalAnswered === 0 || answeredParticipants.length === 0) {
										return (
											<h3 className={styles['review-no-answers-text']}>
												Немає відповідей на це запитання...
											</h3>
										);
									}

									// Show cards for participants who scored something
									return (
										<div className={styles['review-students-grid']}>
											{answeredParticipants.map((p) => (
												<div key={p.participantId} className={styles['student-answer-card']}>
													<div className={styles['student-answer-header']}>
														<div className={styles['student-answer-name']}>
															<span className={styles['student-avatar-icon']}>👤</span>
															<span>{p.nickname}</span>
														</div>
													</div>
													<div className={styles['student-answer-score']}>
														Поточний бал: <strong style={{ color: '#fff' }}>{p.score}</strong>
													</div>
												</div>
											))}
										</div>
									);
								})()}
							</div>
						)}
					</div>
				</div>

				{/* Bottom Controls: Timer & Next Question */}
				<div className={styles['teacher-bottom-controls']}>
					<div className={styles['bottom-timer-section']}>
						<img src={timerIcon} alt="Timer" className={styles['bottom-timer-icon']} />
						<span className={styles['bottom-timer-text']}>{remainingSeconds}</span>
					</div>

					<div className={styles['bottom-controls-buttons']}>
						<button
							type="button"
							className={styles['bottom-control-btn']}
							onClick={() => onExtendTime(15)}
						>
							<div className={styles['bottom-control-btn-inner']}>
								<p>+15 сек</p>
							</div>
						</button>

						<button
							type="button"
							className={styles['bottom-control-btn']}
							onClick={onNextQuestion}
							title="Перейти до наступного"
						>
							<div className={styles['bottom-control-btn-inner']}>
								<img src={nextIcon} alt="Далі" className={styles['bottom-next-icon']} />
							</div>
						</button>
					</div>
				</div>
			</div>

			{/* Sidebar Participants */}
			<aside className={styles['game-sidebar']}>
				<div className={styles['game-sidebar-header']}>
					<span>Учасники: ({participants.length})</span>
					<span style={{ color: 'var(--color-text-muted)' }}>⚙</span>
				</div>
				<div className={styles['game-sidebar-list']}>
					{participants.map((p, idx) => (
						<div key={p.participantId || idx} className={styles['participant-item']}>
							<div className={styles['participant-item-left']}>
								<span className={styles['participant-badge']}>{idx + 1}</span>
								<span style={{ fontWeight: 600 }}>{p.nickname}</span>
							</div>
							<span style={{ fontSize: '0.85rem', color: 'var(--color-accent, #863bff)', fontWeight: 700 }}>
								{p.score} б
							</span>
						</div>
					))}
				</div>
			</aside>
		</div>
	);
}
