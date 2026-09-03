import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import type { SessionReportTab } from './SessionReportPage.types';
import { useGetSessionReportQuery } from '../../api';
import { StudentDetailDrawer } from '../StudentDetailDrawer';
import { pluralize, pluralizeAnswers } from '../../../../shared';
import styles from '../Reports.module.css';
import type { SessionQuestionStatsDto, SessionParticipantSummaryDto } from '@viaquiz/shared-types';

export const SessionReportPage: React.FC = () => {
	const navigate = useNavigate();
	const { roomUuid } = useParams<{ roomUuid: string }>();
	const { data: report, isLoading, isError } = useGetSessionReportQuery(roomUuid as string, {
		skip: !roomUuid,
	});

	useEffect(() => {
		if (!roomUuid || isError) {
			navigate('/not-found', { replace: true });
		}
	}, [roomUuid, isError, navigate]);

	const [activeTab, setActiveTab] = useState<SessionReportTab>('overview');
	const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);

	const formatDate = (isoString: string | null) => {
		if (!isoString) return '—';
		return new Date(isoString).toLocaleString('uk-UA', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (isLoading) return <div className={styles['report-page']}>Завантаження...</div>;
	if (isError || !report) return null;

	return (
		<div className={styles['report-page']}>
			<div className={styles['report-header']}>
				<h1>{report.quizName}</h1>
				<div className={styles['report-meta']}>
					<span>
						Курс: {report.courseName 
							? `${report.courseName}${report.groupName ? ` (${report.groupName})` : ''}` 
							: (report.groupName ? `(${report.groupName})` : '—')}
					</span>
					<span>Початок: {formatDate(report.startedAt)}</span>
					<span>Завершення: {formatDate(report.endedAt)}</span>
				</div>
			</div>

			<div className={styles['report-summary-cards']}>
				<div className={styles['report-summary-card']}>
					<span className={styles['report-summary-card__value']}>{report.totalParticipants}</span>
					<span className={styles['report-summary-card__label']}>Всього учасників</span>
				</div>
				<div className={styles['report-summary-card']}>
					<span className={styles['report-summary-card__value']}>{report.avgGrade.toFixed(1)}/12</span>
					<span className={styles['report-summary-card__label']}>Середня оцінка</span>
				</div>
				<div className={styles['report-summary-card']}>
					<span className={styles['report-summary-card__value']}>{report.avgPercentage}%</span>
					<span className={styles['report-summary-card__label']}>Середня точність</span>
				</div>
				<div className={styles['report-summary-card']}>
					<span className={styles['report-summary-card__value']}>{report.totalQuestions}</span>
					<span className={styles['report-summary-card__label']}>Всього питань</span>
				</div>
			</div>

			<div className={styles['report-tabs']}>
				<button 
					className={`${styles['report-tab']} ${activeTab === 'overview' ? styles['report-tab--active'] : ''}`}
					onClick={() => setActiveTab('overview')}
				>
					Загальний огляд
				</button>
				<button 
					className={`${styles['report-tab']} ${activeTab === 'questions' ? styles['report-tab--active'] : ''}`}
					onClick={() => setActiveTab('questions')}
				>
					Питання
				</button>
				<button 
					className={`${styles['report-tab']} ${activeTab === 'chart' ? styles['report-tab--active'] : ''}`}
					onClick={() => setActiveTab('chart')}
				>
					Графік
				</button>
			</div>

			<div className={styles['report-tab-content']}>
				{activeTab === 'overview' && (
					<OverviewTab 
						participants={report.participants} 
						onRowClick={(id) => setSelectedParticipantId(id)}
					/>
				)}
				{activeTab === 'questions' && (
					<QuestionsTab questions={report.questionStats} />
				)}
				{activeTab === 'chart' && (
					<ChartTab questions={report.questionStats} />
				)}
			</div>

			{roomUuid && (
				<StudentDetailDrawer
					isOpen={selectedParticipantId !== null}
					onClose={() => setSelectedParticipantId(null)}
					roomUuid={roomUuid}
					participantId={selectedParticipantId}
				/>
			)}
		</div>
	);
};

const OverviewTab: React.FC<{ 
	participants: SessionParticipantSummaryDto[];
	onRowClick: (id: number) => void;
}> = ({ participants, onRowClick }) => {
	const [sortBy, setSortBy] = useState<'percentage' | 'name'>('percentage');

	const sortedParticipants = [...participants].sort((a, b) => {
		if (sortBy === 'percentage') return b.percentage - a.percentage;
		return a.nickname.localeCompare(b.nickname);
	});

	return (
		<div>
			<div className={styles['overview-legend']}>
				<div className={styles['overview-legend-item']}>
					<div className={`${styles['overview-legend-color']} ${styles['overview-legend-color--correct']}`}></div>
					Правильні
				</div>
				<div className={styles['overview-legend-item']}>
					<div className={`${styles['overview-legend-color']} ${styles['overview-legend-color--incorrect']}`}></div>
					Помилка
				</div>
				<div className={styles['overview-legend-item']}>
					<div className={`${styles['overview-legend-color']} ${styles['overview-legend-color--skipped']}`}></div>
					Пропущені
				</div>
				<button 
					className={styles['overview-sort-btn']}
					onClick={() => setSortBy(prev => prev === 'percentage' ? 'name' : 'percentage')}
				>
					Сортувати за: {sortBy === 'percentage' ? 'Точністю' : 'Ім\'ям'}
				</button>
			</div>

			<div className={styles['overview-table-container']}>
				<table className={styles['overview-table']}>
					<thead>
						<tr>
							<th className={styles['overview-col-name']}>Ім'я</th>
							<th className={styles['overview-col-bars']}></th>
							<th className={styles['overview-col-grade']}>Оцінка</th>
							<th className={styles['overview-col-percent']}>Точність</th>
						</tr>
					</thead>
					<tbody>
						{sortedParticipants.map(p => (
							<tr 
								key={p.participantId} 
								className={styles['overview-row']} 
								onClick={() => onRowClick(p.participantId)}
							>
								<td className={styles['overview-col-name']}>
									<span className={styles['overview-nickname']}>{p.nickname}</span>
								</td>
								<td className={styles['overview-col-bars']}>
									<div className={styles['stacked-bar']}>
										{p.questionStatuses.map((status, idx) => (
											<div 
												key={idx}
												className={`${styles['stacked-bar__segment']} ${
													status === 'CORRECT' ? styles['stacked-bar__segment--correct'] :
													status === 'INCORRECT' ? styles['stacked-bar__segment--incorrect'] :
													styles['stacked-bar__segment--skipped']
												}`}
											/>
										))}
									</div>
								</td>
								<td className={styles['overview-col-grade']}>{p.grade}</td>
								<td className={styles['overview-col-percent']}>{p.percentage}%</td>
							</tr>
						))}
						{sortedParticipants.length === 0 && (
							<tr>
								<td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
									Немає учасників у цій сесії
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const QuestionsTab: React.FC<{ questions: SessionQuestionStatsDto[] }> = ({ questions }) => {
	return (
		<div className={styles['questions-list']}>
			{questions.map(q => (
				<div key={q.questionId} className={styles['question-stat-card']}>
					<div className={styles['question-stat-card__number']}>
						{q.questionNumber}
					</div>
					<div className={styles['question-stat-card__text']} title={q.text}>
						{q.text}
					</div>
					<div className={styles['question-stat-card__stats']}>
						<div className={styles['question-stat-card__stats-row']}>
							<span>Прав: {q.correctCount}</span>
							<span>Пом: {q.incorrectCount}</span>
							<span>Проп: {q.skippedCount}</span>
						</div>
						<div className={styles['question-stat-card__bar-container']}>
							<div 
								className={styles['question-stat-card__bar']} 
								style={{ width: `${q.correctPercentage}%` }}
							></div>
						</div>
						<div className={styles['question-stat-card__stats-row']}>
							<span>Час: {q.avgTimeSpentSec.toFixed(1)}с</span>
							<span>{q.correctPercentage}%</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

const ChartTab: React.FC<{ questions: SessionQuestionStatsDto[] }> = ({ questions }) => {
	const [chartType, setChartType] = useState<'success' | 'time'>('success');
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = useState<number>(0);

	useEffect(() => {
		if (!containerRef.current) return;
		const updateWidth = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.clientWidth);
			}
		};
		updateWidth();
		const observer = new ResizeObserver(updateWidth);
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	const categories = questions.map(q => `Q${q.questionNumber}`);
	const textQuestions = questions.map(q => q.text);
	const correctValues = questions.map(q => q.correctCount);
	const wrongValues = questions.map(q => q.incorrectCount);
	const correctPercents = questions.map(q => q.correctPercentage);
	const wrongPercents = questions.map(q => {
		const total = q.totalParticipants || 1;
		return Math.round((q.incorrectCount / total) * 100);
	});
	const avgTimes = questions.map(q => Number(q.avgTimeSpentSec.toFixed(1)));

	const minBarWidth = 80;
	const naturalBarWidth = containerWidth > 0 && categories.length > 0 
		? containerWidth / categories.length 
		: minBarWidth;
	const chartInnerWidth = naturalBarWidth < minBarWidth 
		? `${categories.length * minBarWidth}px` 
		: '100%';

	const successChartOptions: ApexCharts.ApexOptions = {
		series: [
			{
				name: 'Правильні',
				data: correctPercents,
			},
			{
				name: 'Неправильні',
				data: wrongPercents,
			},
		],
		chart: {
			type: 'bar',
			height: 350,
			width: '100%',
			background: 'transparent',
			toolbar: { show: false },
			stacked: false,
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: '45%',
				distributed: false,
			},
		},
		colors: ['#22c55e', '#ef4444'],
		dataLabels: {
			enabled: true,
			formatter: function (_val, opts) {
				const idx = opts?.dataPointIndex ?? 0;
				const seriesIdx = opts?.seriesIndex ?? 0;
				const percent = seriesIdx === 0 ? correctPercents[idx] : wrongPercents[idx];
				return percent && percent > 0 ? percent + '%' : '';
			},
			style: {
				colors: ['#fff'],
				fontSize: '11px',
			},
		},
		xaxis: {
			categories: categories,
			labels: {
				style: {
					colors: '#a1a1a1',
					fontSize: '14px',
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			min: 0,
			max: 100,
			tickAmount: 5,
			labels: {
				style: { colors: '#a1a1a1' },
				formatter: function (val) {
					return val + '%';
				},
			},
		},
		grid: {
			borderColor: '#333',
			yaxis: { lines: { show: true } },
			xaxis: { lines: { show: false } },
		},
		legend: {
			show: true,
			labels: { colors: '#a1a1a1' },
		},
		tooltip: {
			theme: 'dark',
			shared: true,
			intersect: false,
			x: {
				formatter: function (_val, opts) {
					const idx = opts?.dataPointIndex ?? 0;
					return textQuestions[idx] || `Q${idx + 1}`;
				},
			},
			y: {
				formatter: function (val, opts) {
					const idx = opts?.dataPointIndex ?? 0;
					const seriesIdx = opts?.seriesIndex ?? 0;
					const count = seriesIdx === 0 ? correctValues[idx] : wrongValues[idx];
					const label =
						seriesIdx === 0
							? pluralize(count, { uk: ['правильна', 'правильні', 'правильних'], en: ['correct', 'correct'] })
							: pluralize(count, { uk: ['неправильна', 'неправильні', 'неправильних'], en: ['incorrect', 'incorrect'] });
					const answersWord = pluralizeAnswers(count);
					return `${count} ${label} ${answersWord} (${val}%)`;
				},
			},
		},
		noData: {
			text: 'Дані відсутні',
			style: { color: '#a1a1a1', fontSize: '16px' },
		},
	};

	const successSeries = [
		{ name: 'Правильні', data: correctPercents },
		{ name: 'Неправильні', data: wrongPercents },
	];

	const timeChartOptions: ApexCharts.ApexOptions = {
		series: [
			{
				name: 'Середній час',
				data: avgTimes,
			},
		],
		chart: {
			type: 'line',
			height: 350,
			width: '100%',
			background: 'transparent',
			toolbar: { show: false },
		},
		stroke: {
			curve: 'straight',
			width: 3,
		},
		colors: ['#775DD0'],
		markers: {
			size: 5,
			colors: ['#775DD0'],
			strokeColors: '#fff',
			strokeWidth: 2,
			hover: { size: 7 },
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			categories: categories,
			labels: {
				style: {
					colors: '#a1a1a1',
					fontSize: '14px',
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			min: 0,
			labels: {
				style: { colors: '#a1a1a1' },
				formatter: function (val) {
					return val + 'с';
				},
			},
		},
		grid: {
			borderColor: '#333',
			yaxis: { lines: { show: true } },
			xaxis: { lines: { show: false } },
		},
		legend: { show: false },
		tooltip: {
			theme: 'dark',
			x: {
				formatter: function (_val, opts) {
					const idx = opts?.dataPointIndex ?? 0;
					return textQuestions[idx] || `Q${idx + 1}`;
				},
			},
			y: {
				formatter: function (val) {
					return val + ' сек.';
				},
			},
		},
		noData: {
			text: 'Дані відсутні',
			style: { color: '#a1a1a1', fontSize: '16px' },
		},
	};

	const timeSeries = [
		{ name: 'Середній час', data: avgTimes },
	];

	return (
		<div className={styles['chart-container']}>
			<div className={styles['chart-header']}>
				<div className={styles['chart-title']}>Статистика питань</div>
				<select 
					className={styles['chart-selector']}
					value={chartType}
					onChange={(e) => setChartType(e.target.value as 'success' | 'time')}
				>
					<option value="success">Успішність по запитанням</option>
					<option value="time">Середн. час на запитання</option>
				</select>
			</div>
			
			<div ref={containerRef} className={styles['chart-scroll-wrapper']}>
				<div style={{ width: chartInnerWidth, minWidth: '100%', minHeight: '350px' }}>
					{chartType === 'success' ? (
						<Chart 
							key="success-chart"
							options={successChartOptions} 
							series={successSeries} 
							type="bar" 
							height={350} 
							width="100%" 
						/>
					) : (
						<Chart 
							key="time-chart"
							options={timeChartOptions} 
							series={timeSeries} 
							type="line" 
							height={350} 
							width="100%" 
						/>
					)}
				</div>
			</div>
		</div>
	);
};
