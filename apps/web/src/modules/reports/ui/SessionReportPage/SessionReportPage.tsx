import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import type { SessionReportTab, ReportSortBy, OverviewTabProps } from './SessionReportPage.types';
import { useGetSessionReportQuery } from '../../api';
import { StudentDetailDrawer } from '../StudentDetailDrawer';
import { pluralize, pluralizeAnswers } from '../../../../shared';
import styles from '../Reports.module.css';
import type { SessionQuestionStatsDto, SortOrder } from '@viaquiz/shared-types';

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

const SORT_LABELS: Record<ReportSortBy, string> = {
	percentage: 'Точністю',
	grade: 'Оцінкою',
	name: "Ім'ям",
};

const OverviewTab: React.FC<OverviewTabProps> = ({ participants, onRowClick }) => {
	const [sortBy, setSortBy] = useState<ReportSortBy>('percentage');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
	const sortDropdownRef = useRef<HTMLDivElement>(null);

	// Close sort dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
				setIsSortDropdownOpen(false);
			}
		};
		if (isSortDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isSortDropdownOpen]);

	// Close sort dropdown on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isSortDropdownOpen) {
				setIsSortDropdownOpen(false);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSortDropdownOpen]);

	const handleSortBySelect = (field: ReportSortBy) => {
		setSortBy(field);
		setIsSortDropdownOpen(false);
		setSortOrder(field === 'name' ? 'asc' : 'desc');
	};

	const toggleSortOrder = () => {
		setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
	};

	const handleHeaderClick = (field: ReportSortBy) => {
		if (sortBy === field) {
			toggleSortOrder();
		} else {
			setSortBy(field);
			setSortOrder(field === 'name' ? 'asc' : 'desc');
		}
	};

	const sortedParticipants = useMemo(() => {
		return [...participants].sort((a, b) => {
			let comparison = 0;
			if (sortBy === 'percentage') {
				comparison = a.percentage - b.percentage;
				if (comparison === 0) comparison = a.score - b.score;
			} else if (sortBy === 'grade') {
				comparison = a.grade - b.grade;
				if (comparison === 0) comparison = a.percentage - b.percentage;
			} else if (sortBy === 'name') {
				const nameA = (a.studentName || a.nickname || '').trim();
				const nameB = (b.studentName || b.nickname || '').trim();
				comparison = nameA.localeCompare(nameB, 'uk', { sensitivity: 'base' });
			}

			if (comparison === 0) {
				comparison = a.participantId - b.participantId;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});
	}, [participants, sortBy, sortOrder]);

	return (
		<div>
			<div className={styles['overview-toolbar']}>
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
				</div>

				<div className={styles['overview-sort-group']}>
					<div className={styles['overview-sort-dropdown-container']} ref={sortDropdownRef}>
						<button 
							type="button"
							className={`${styles['overview-sort-btn']} ${isSortDropdownOpen ? styles['overview-sort-btn--active'] : ''}`}
							onClick={() => setIsSortDropdownOpen(prev => !prev)}
							title="Змінити критерій сортування"
							aria-haspopup="listbox"
							aria-expanded={isSortDropdownOpen}
						>
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<line x1="21" y1="10" x2="3" y2="10" />
								<line x1="21" y1="6" x2="3" y2="6" />
								<line x1="18" y1="14" x2="3" y2="14" />
								<line x1="14" y1="18" x2="3" y2="18" />
							</svg>
							<span className={styles['overview-sort-btn-label']}>Сортувати за:</span>
							<span className={styles['overview-sort-btn-value']}>{SORT_LABELS[sortBy]}</span>
							<svg 
								className={`${styles['overview-sort-chevron']} ${isSortDropdownOpen ? styles['overview-sort-chevron--open'] : ''}`} 
								width="14" 
								height="14" 
								viewBox="0 0 24 24" 
								fill="none" 
								stroke="currentColor" 
								strokeWidth="2.5" 
								strokeLinecap="round" 
								strokeLinejoin="round"
							>
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>

						{isSortDropdownOpen && (
							<div className={styles['overview-sort-menu']} role="listbox">
								<button
									type="button"
									className={`${styles['overview-sort-option']} ${sortBy === 'percentage' ? styles['overview-sort-option--active'] : ''}`}
									onClick={() => handleSortBySelect('percentage')}
								>
									<span>Точністю</span>
									{sortBy === 'percentage' && (
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="20 6 9 17 4 12" />
										</svg>
									)}
								</button>
								<button
									type="button"
									className={`${styles['overview-sort-option']} ${sortBy === 'grade' ? styles['overview-sort-option--active'] : ''}`}
									onClick={() => handleSortBySelect('grade')}
								>
									<span>Оцінкою</span>
									{sortBy === 'grade' && (
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="20 6 9 17 4 12" />
										</svg>
									)}
								</button>
								<button
									type="button"
									className={`${styles['overview-sort-option']} ${sortBy === 'name' ? styles['overview-sort-option--active'] : ''}`}
									onClick={() => handleSortBySelect('name')}
								>
									<span>Ім'ям</span>
									{sortBy === 'name' && (
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="20 6 9 17 4 12" />
										</svg>
									)}
								</button>
							</div>
						)}
					</div>

					<button 
						type="button"
						className={styles['overview-sort-order-btn']}
						onClick={toggleSortOrder}
						title={sortOrder === 'asc' ? 'За зростанням (клікніть для сортування за спаданням)' : 'За спаданням (клікніть для сортування за зростанням)'}
						aria-label={sortOrder === 'asc' ? 'За зростанням' : 'За спаданням'}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							{sortOrder === 'asc' ? (
								<>
									<line x1="12" y1="19" x2="12" y2="5" />
									<polyline points="5 12 12 5 19 12" />
								</>
							) : (
								<>
									<line x1="12" y1="5" x2="12" y2="19" />
									<polyline points="19 12 12 19 5 12" />
								</>
							)}
						</svg>
					</button>
				</div>
			</div>

			<div className={styles['overview-table-container']}>
				<table className={styles['overview-table']}>
					<thead>
						<tr>
							<th 
								className={`${styles['overview-col-name']} ${styles['overview-th-sortable']}`}
								onClick={() => handleHeaderClick('name')}
								title="Сортувати за ім'ям"
							>
								<div className={styles['overview-th-content']}>
									<span>Ім'я</span>
									{sortBy === 'name' && (
										<span className={styles['overview-th-sort-icon']}>
											{sortOrder === 'asc' ? '↑' : '↓'}
										</span>
									)}
								</div>
							</th>
							<th className={styles['overview-col-bars']}></th>
							<th 
								className={`${styles['overview-col-grade']} ${styles['overview-th-sortable']}`}
								onClick={() => handleHeaderClick('grade')}
								title="Сортувати за оцінкою"
							>
								<div className={`${styles['overview-th-content']} ${styles['overview-th-content--center']}`}>
									<span>Оцінка</span>
									{sortBy === 'grade' && (
										<span className={styles['overview-th-sort-icon']}>
											{sortOrder === 'asc' ? '↑' : '↓'}
										</span>
									)}
								</div>
							</th>
							<th 
								className={`${styles['overview-col-percent']} ${styles['overview-th-sortable']}`}
								onClick={() => handleHeaderClick('percentage')}
								title="Сортувати за точністю"
							>
								<div className={`${styles['overview-th-content']} ${styles['overview-th-content--center']}`}>
									<span>Точність</span>
									{sortBy === 'percentage' && (
										<span className={styles['overview-th-sort-icon']}>
											{sortOrder === 'asc' ? '↑' : '↓'}
										</span>
									)}
								</div>
							</th>
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
									<div className={styles['overview-name-container']}>
										<span className={styles['overview-nickname']}>{p.nickname}</span>
										{p.studentName && (
											<span className={styles['overview-student-name']}>{p.studentName}</span>
										)}
									</div>
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
