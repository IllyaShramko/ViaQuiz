import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTeacherSessionsQuery } from '../../api';
import styles from '../Reports.module.css';

export const ReportsListPage: React.FC = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchQuery(searchInput);
			setPage(1);
		}, 500);
		return () => clearTimeout(handler);
	}, [searchInput]);

	const { data, isLoading, isError } = useGetTeacherSessionsQuery({
		page,
		pageSize: 10,
		search: searchQuery || undefined,
	});

	const handlePrevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
	const handleNextPage = useCallback(() => {
		if (data && data.total > page * data.pageSize) {
			setPage(p => p + 1);
		}
	}, [data, page]);

	const formatDate = (isoString: string | null) => {
		if (!isoString) return '—';
		const date = new Date(isoString);
		return date.toLocaleString('uk-UA', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'FINISHED': return 'Завершено';
			case 'PROGRESS': return 'В процесі';
			case 'AWAITING': return 'Очікування';
			case 'REVIEWING': return 'Перевірка';
			default: return status;
		}
	};

	return (
		<div className={styles['reports-page']}>
			<h1>Звіти</h1>
			<div className={styles['reports-search-box']}>
				<span role="img" aria-label="search">🔍</span>
				<input
					type="text"
					placeholder="Пошук звітів..."
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
				/>
			</div>

			{isLoading && <p>Завантаження...</p>}
			{isError && <p>Помилка при завантаженні звітів.</p>}

			{!isLoading && !isError && data && (
				<>
					{data.sessions.length === 0 ? (
						<div className={styles['reports-empty-state']}>
							<p>Сесій не знайдено</p>
						</div>
					) : (
						<div className={styles['reports-table-wrapper']}>
							<table className={styles['reports-table']}>
								<thead>
									<tr>
										<th>Назва гри</th>
										<th>Клас/Курс</th>
										<th>Учасники</th>
										<th>Сер. бал</th>
										<th>Сер. %</th>
										<th>Статус</th>
										<th>Дата</th>
										<th>Дія</th>
									</tr>
								</thead>
								<tbody>
									{data.sessions.map(session => (
										<tr key={session.roomUuid}>
											<td>{session.quizName}</td>
											<td>
												{session.courseName
													? `${session.courseName}${session.groupName ? ` (${session.groupName})` : ''}`
													: (session.groupName ? `(${session.groupName})` : '—')}
											</td>
											<td>{session.participantsCount}</td>
											<td>{session.avgScore.toFixed(1)}</td>
											<td>{session.avgPercentage}%</td>
											<td>
												<span className={`${styles['reports-status-badge']} ${session.status === 'FINISHED' ? styles['reports-status-badge--finished'] : ''}`}>
													{getStatusLabel(session.status)}
												</span>
											</td>
											<td>{formatDate(session.endedAt || session.createdAt)}</td>
											<td>
												<button
													className={styles['reports-view-btn']}
													onClick={() => navigate(`/dashboard/reports/${session.roomUuid}`)}
												>
													Переглянути
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					
					{data.total > data.pageSize && (
						<div className={styles['reports-pagination']}>
							<button 
								className={styles['reports-pagination-btn']} 
								disabled={page === 1}
								onClick={handlePrevPage}
							>
								Назад
							</button>
							<span className={styles['reports-pagination-info']}>
								Сторінка {page}
							</span>
							<button 
								className={styles['reports-pagination-btn']} 
								disabled={page * data.pageSize >= data.total}
								onClick={handleNextPage}
							>
								Вперед
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};
