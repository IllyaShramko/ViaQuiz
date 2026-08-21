import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import type { ParticipantDto } from '@viaquiz/shared-types';
import styles from '../GameSession.module.css';

export interface FinalResultsHostProps {
	quizName?: string;
	totalQuestions: number;
	leaderboard: ParticipantDto[];
}

export function FinalResultsHost({
	quizName = 'Вікторина',
	totalQuestions,
	leaderboard,
}: FinalResultsHostProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<'overview' | 'chart'>('overview');

	// Prepare data for Chart
	const participantNames = leaderboard.map((p) => p.nickname);
	const participantScores = leaderboard.map((p) => p.score);

	const chartOptions: ApexCharts.ApexOptions = {
		chart: {
			type: 'bar',
			background: 'transparent',
			toolbar: { show: false },
		},
		theme: { mode: 'dark' },
		plotOptions: {
			bar: {
				borderRadius: 6,
				columnWidth: '45%',
				distributed: true,
			},
		},
		dataLabels: { enabled: false },
		xaxis: {
			categories: participantNames,
			labels: { style: { colors: '#9090a8', fontSize: '12px' } },
		},
		yaxis: {
			labels: { style: { colors: '#9090a8', fontSize: '12px' } },
		},
		colors: ['#863bff', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
		grid: { borderColor: '#2a2a3a' },
	};

	const chartSeries = [
		{
			name: 'Набрані бали',
			data: participantScores,
		},
	];

	return (
		<div className={styles['game-main-content']}>
			<div className={styles['results-card']}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div>
						<h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
							Результати вікторини
						</h2>
						<p style={{ color: 'var(--color-text-secondary, #9090a8)', marginTop: '0.25rem' }}>
							{quizName} • Запитань: {totalQuestions} • Учасників: {leaderboard.length}
						</p>
					</div>

					<button
						type="button"
						className={styles['lobby-start-btn']}
						style={{ padding: '0.6rem 1.25rem' }}
						onClick={() => navigate('/dashboard')}
					>
						До панелі вчителя
					</button>
				</div>

				{/* Tabs */}
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
							activeTab === 'chart' ? styles['is-active'] : ''
						}`}
						onClick={() => setActiveTab('chart')}
					>
						Графік
					</button>
				</div>

				{/* Tab 1: Table */}
				{activeTab === 'overview' && (
					<div style={{ overflowX: 'auto' }}>
						<table className={styles['results-table']}>
							<thead>
								<tr>
									<th>#</th>
									<th>Ім'я учасника</th>
									<th>Сума балів</th>
									<th>Оцінка (1-12)</th>
								</tr>
							</thead>
							<tbody>
								{leaderboard.map((p, idx) => {
									const maxPoints = totalQuestions * 1000 || 1;
									const grade12 = Math.min(12, Math.max(1, Math.round((p.score / maxPoints) * 12)));

									return (
										<tr key={p.participantId || idx}>
											<td style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>
												{idx + 1}
											</td>
											<td style={{ fontWeight: 700, color: '#fff' }}>{p.nickname}</td>
											<td style={{ color: 'var(--color-accent, #863bff)', fontWeight: 800 }}>
												{p.score}
											</td>
											<td>
												<span
													style={{
														background: 'var(--color-bg-surface, #1a1a26)',
														border: '1px solid var(--color-border, #2a2a3a)',
														padding: '0.25rem 0.65rem',
														borderRadius: 'var(--radius-sm)',
														fontWeight: 700,
														color: '#fff',
													}}
												>
													{grade12} / 12
												</span>
											</td>
										</tr>
									);
								})}
								{leaderboard.length === 0 && (
									<tr>
										<td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
											Немає даних про учасників
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{/* Tab 2: Chart */}
				{activeTab === 'chart' && (
					<div style={{ width: '100%', height: '350px' }}>
						<Chart
							options={chartOptions}
							series={chartSeries}
							type="bar"
							height={350}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
