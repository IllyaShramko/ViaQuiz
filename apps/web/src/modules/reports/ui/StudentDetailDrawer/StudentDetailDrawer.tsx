import React, { useEffect } from 'react';
import Chart from 'react-apexcharts';
import type { StudentDetailDrawerProps } from './StudentDetailDrawer.types';
import { useGetParticipantReportQuery } from '../../api';
import styles from '../Reports.module.css';

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
	isOpen,
	onClose,
	roomUuid,
	participantId,
}) => {
	const { data: report, isLoading, isError } = useGetParticipantReportQuery(
		{ roomUuid, participantId: participantId as number },
		{ skip: !isOpen || !participantId }
	);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [onClose]);

	const timeChartOptions: ApexCharts.ApexOptions = {
		chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
		theme: { mode: 'dark' },
		plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
		dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)} с`, style: { fontSize: '10px' } },
		xaxis: { 
			categories: report?.questions.map((_, i) => `Q${i + 1}`) || [], 
			labels: { style: { colors: '#9090a8' } } 
		},
		yaxis: { labels: { style: { colors: '#9090a8' }, formatter: (val) => `${val} с` } },
		colors: ['#863bff'],
		grid: { borderColor: '#2a2a3a' },
		tooltip: { theme: 'dark' },
	};

	const timeSeries = [
		{ name: 'Час', data: report?.questions.map(q => q.timeSpentSec) || [] }
	];

	return (
		<>
			<div 
				className={`${styles['drawer-overlay']} ${isOpen ? styles['drawer-overlay--open'] : ''}`} 
				onClick={onClose}
			/>
			<div className={`${styles['drawer']} ${isOpen ? styles['drawer--open'] : ''}`}>
				<div className={styles['drawer-header']}>
					<div className={styles['drawer-title-box']}>
						<div className={styles['drawer-title']}>
							Результати {report?.participant.nickname || '...'}
						</div>
						{report?.participant.studentName && (
							<div className={styles['drawer-student-name']}>
								{report.participant.studentName}
							</div>
						)}
					</div>
					<button className={styles['drawer-close-btn']} onClick={onClose}>×</button>
				</div>
				
				<div className={styles['drawer-body']}>
					{isLoading && <div>Завантаження...</div>}
					{isError && <div>Помилка завантаження даних.</div>}
					{!isLoading && !isError && report && (
						<>
							<div className={styles['drawer-chart-section']}>
								<div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
									Час на кожне запитання
								</div>
								<Chart options={timeChartOptions} series={timeSeries} type="bar" height={300} />
								
								<div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
									{report.participant.studentName && <div>Учень: {report.participant.studentName}</div>}
									<div>Всього балів: {report.score}</div>
									<div>Оцінка: {report.grade}/12 ({report.percentage}%)</div>
									<div>Правильних: {report.correctAnswersCount} / {report.totalQuestionsCount}</div>
									<div>Витрачено часу: {report.totalTimeSpentSec}с</div>
								</div>
							</div>
							
							<div className={styles['drawer-questions-section']}>
								{report.questions.map((q, index) => (
									<div 
										key={q.questionId}
										className={`${styles['drawer-question-card']} ${
											q.status === 'CORRECT' ? styles['drawer-question-card--correct'] :
											q.status === 'INCORRECT' ? styles['drawer-question-card--incorrect'] :
											styles['drawer-question-card--skipped']
										}`}
									>
										<div className={styles['drawer-question-card__header']}>
											<span>Запитання {index + 1}</span>
											<span>{q.earnedPoints}/{q.points} б.</span>
										</div>
										<div className={styles['drawer-question-card__text']}>
											{q.text}
										</div>
										<div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
											<div className={styles['drawer-question-card__answer-label']}>Відповідь учня:</div>
											<div className={styles['drawer-question-card__answer']}>{q.studentAnswer || '—'}</div>
										</div>
										{q.status !== 'CORRECT' && (
											<div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
												<div className={styles['drawer-question-card__answer-label']}>Правильна відповідь:</div>
												<div className={styles['drawer-question-card__answer']} style={{ color: '#10b981' }}>{q.correctAnswer}</div>
											</div>
										)}
									</div>
								))}
							</div>
						</>
					)}
				</div>
				
				<div className={styles['drawer-footer']}>
					<button className={styles['drawer-ok-btn']} onClick={onClose}>
						Готово
					</button>
				</div>
			</div>
		</>
	);
};
