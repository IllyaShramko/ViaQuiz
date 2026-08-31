import { useState } from 'react';
import Chart from 'react-apexcharts';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';
import { ParticipantsSidebar } from '../sidebar/ParticipantsSidebar';
import type {
	GameQuestionDto,
	GameReviewDataDto,
	ParticipantDto,
} from '@viaquiz/shared-types';
import correctIcon from '../../../../assets/icons/correct_answers.svg';
import wrongIcon from '../../../../assets/icons/wrong_answers.svg';
import skippedIcon from '../../../../assets/icons/skipped_answers.svg';
import nextIcon from '../../../../assets/icons/next.svg';
import { TimerIcon } from '../../../../shared/ui/icons';
import styles from '../GameSession.module.css';

export interface ReviewHostViewProps {
	question: GameQuestionDto;
	reviewData: GameReviewDataDto;
	participants: ParticipantDto[];
	remainingSeconds: number;
	onExtendTime?: (secs?: number) => void;
	onNextQuestion: () => void;
	onKickParticipant?: (participantId: number) => void;
}

export function ReviewHostView({
	question,
	reviewData,
	participants,
	remainingSeconds,
	onNextQuestion,
	onKickParticipant,
}: ReviewHostViewProps) {
	const [activeTab, setActiveTab] = useState<'overview' | 'answers'>('overview');
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);

	const distribution = reviewData.answersDistribution || {};
	const totalParticipants = participants.length || 1;

	// Calculate counts using participantAnswers if available or distribution
	const correctIds = reviewData.correctVariantIds;
	let correctCount = 0;
	let wrongCount = 0;
	let skippedCount = 0;
	let totalAnswered = 0;

	if (reviewData.participantAnswers && reviewData.participantAnswers.length > 0) {
		for (const pa of reviewData.participantAnswers) {
			if (!pa.isAnswered) {
				skippedCount++;
			} else {
				totalAnswered++;
				if (pa.isCorrect) {
					correctCount++;
				} else {
					wrongCount++;
				}
			}
		}
	} else {
		for (const [vIdStr, count] of Object.entries(distribution)) {
			const vId = Number(vIdStr);
			totalAnswered += count;
			if (correctIds.includes(vId)) {
				correctCount += count;
			}
		}
		wrongCount = Math.max(0, totalAnswered - correctCount);
		skippedCount = Math.max(0, totalParticipants - totalAnswered);
	}
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

	const isTypeV1 = question.type === 'TYPE_ANSWER_V1';
	const isTypeV2 = question.type === 'TYPE_ANSWER_V2';
	const isTyped = isTypeV1 || isTypeV2;
	const correctAnswersText =
		reviewData.correctTextAnswers?.join(' / ') ||
		question.variants.map((v) => v.text).filter(Boolean).join(' / ') ||
		'—';

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
					<div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
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
								Відповіді
							</button>
						</div>

						{/* Tab 1: General Overview */}
						{activeTab === 'overview' && (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
								<h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
									{question.text}
								</h3>

								{question.media && (
									<img
										src={question.media}
										alt="Question media"
										className={styles['question-media-img']}
										onClick={() => setLightboxImage(question.media || null)}
										style={{ maxHeight: '180px', width: 'auto', alignSelf: 'center', margin: '0.5rem auto' }}
									/>
								)}

								{isTyped ? (
									<div className={styles['typed-review-card']} style={{ margin: 0, maxWidth: '100%' }}>
										<div className={styles['typed-review-row']}>
											<span className={styles['typed-review-label']}>
												{isTypeV2 ? 'Тип: Слово по буквах' : 'Тип: Ввід тексту'}
											</span>
											<div className={`${styles['typed-review-value']} ${styles['is-correct']}`}>
												Правильна відповідь: {correctAnswersText}
											</div>
										</div>
									</div>
								) : (
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
								)}
							</div>
						)}

						{/* Tab 2: Individual Answers */}
						{activeTab === 'answers' && (
							<div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
								{(() => {
									if (participants.length === 0) {
										return (
											<h3 className={styles['review-no-answers-text']}>
												Немає учасників у сесії...
											</h3>
										);
									}

									// Map each participant to their answer information and keep only answered
									const answeredStudents = participants
										.map((p) => {
											const pa = reviewData.participantAnswers?.find(
												(item) => item.participantId === p.participantId,
											);
											return {
												participantId: p.participantId,
												nickname: p.nickname,
												totalScore: pa?.totalScore !== undefined ? pa.totalScore : p.score,
												isAnswered: pa ? pa.isAnswered : false,
												variantIds: pa ? pa.variantIds || [] : [],
												typedAnswer: pa ? pa.typedAnswer : undefined,
												timeSpentMs: pa ? pa.timeSpentMs : 0,
												isCorrect: pa ? pa.isCorrect : false,
												scoreEarned: pa ? pa.scoreEarned : 0,
											};
										})
										.filter((student) => student.isAnswered);

									// If no participant answered at all
									if (answeredStudents.length === 0) {
										return (
											<h3 className={styles['review-no-answers-text']}>
												Немає відповідей на це запитання...
											</h3>
										);
									}

									return (
										<div className={styles['review-students-grid']}>
											{answeredStudents.map((student, idx) => {
												const cardStatusClass = student.isCorrect
													? styles['is-correct']
													: styles['is-wrong'];

												return (
													<div
														key={student.participantId}
														className={`${styles['student-answer-card']} ${cardStatusClass}`}
														style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}
													>
														<div className={styles['student-answer-header']}>
															<div className={styles['student-answer-name']}>
																<span className={styles['student-avatar-icon']}>👤</span>
																<span>{student.nickname}</span>
															</div>
															{student.isCorrect ? (
																<span
																	className={`${styles['student-status-badge']} ${styles['status-correct']}`}
																>
																	✓ Правильно {student.scoreEarned > 0 ? `(+${student.scoreEarned})` : ''}
																</span>
															) : (
																<span
																	className={`${styles['student-status-badge']} ${styles['status-wrong']}`}
																>
																	✗ Неправильно (+0)
																</span>
															)}
														</div>

														<div className={styles['student-answer-body']}>
															{student.typedAnswer ? (
																<div className={styles['student-selected-variant']}>
																	<span className={styles['student-variant-text']} style={{ fontWeight: 600 }}>
																		Відповідь: &ldquo;{student.typedAnswer}&rdquo;
																	</span>
																	{student.isCorrect && (
																		<span
																			style={{
																				color: 'var(--color-success, #22c55e)',
																				fontSize: '0.75rem',
																				fontWeight: 700,
																				marginLeft: 'auto',
																			}}
																		>
																			✓
																		</span>
																	)}
																</div>
															) : student.variantIds.length > 0 ? (
																<div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
																	{student.variantIds.map((vId) => {
																		const variant = question.variants.find((v) => v.id === vId);
																		const variantIndex =
																			question.variants.findIndex((v) => v.id === vId) + 1;
																		const isThisCorrect = correctIds.includes(vId);

																		return (
																			<div
																				key={vId}
																				className={styles['student-selected-variant']}
																			>
																				<span className={styles['student-variant-num']}>
																					{variantIndex > 0 ? variantIndex : '•'}
																				</span>
																				<span className={styles['student-variant-text']}>
																					{variant?.text || 'Варіант без тексту'}
																				</span>
																				{isThisCorrect && (
																					<span
																						style={{
																							color: 'var(--color-success, #22c55e)',
																							fontSize: '0.75rem',
																							fontWeight: 700,
																							marginLeft: 'auto',
																						}}
																					>
																						✓
																					</span>
																				)}
																			</div>
																		);
																	})}
																</div>
															) : (
																<div className={styles['student-selected-variant-skipped']}>
																	Час вийшов (без відповіді)
																</div>
															)}
														</div>

														<div className={styles['student-answer-footer']}>
															<div className={styles['student-answer-time']}>
																{student.timeSpentMs > 0 ? (
																	<span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
																		<TimerIcon size={14} /> {(student.timeSpentMs / 1000).toFixed(1)} сек
																	</span>
																) : (
																	<span>-</span>
																)}
															</div>
															<div className={styles['student-answer-total-score']}>
																Загальний бал: <strong>{student.totalScore}</strong> б
															</div>
														</div>
													</div>
												);
											})}
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
						<TimerIcon size={24} className={styles['bottom-timer-icon']} />
						<span className={styles['bottom-timer-text']}>{remainingSeconds} с</span>
					</div>

					<div className={styles['bottom-controls-buttons']}>
						<button
							type="button"
							className={styles['bottom-control-btn']}
							disabled={true}
							title="Неможливо додати час на етапі огляду відповідей"
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
			<ParticipantsSidebar
				participants={participants}
				status="REVIEWING"
				reviewData={reviewData}
				onKickParticipant={onKickParticipant}
			/>

			<ImageLightboxModal
				isOpen={!!lightboxImage}
				imageUrl={lightboxImage}
				onClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
