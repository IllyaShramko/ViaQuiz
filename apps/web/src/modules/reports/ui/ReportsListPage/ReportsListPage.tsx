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

	return (
		<div className={styles['reports-page']}>
			<div className={styles['reports-search-box']}>
				<svg
					className={styles['reports-search-icon']}
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					placeholder="Пошук звітів..."
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
				/>
				{searchInput && (
					<button
						type="button"
						className={styles['reports-search-clear-btn']}
						onClick={() => setSearchInput('')}
						aria-label="Очистити пошук"
					>
						✕
					</button>
				)}
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
										<th>Дата</th>
									</tr>
								</thead>
								<tbody>
									{data.sessions.map(session => (
										<tr 
											key={session.roomUuid} 
											className={styles['reports-table-row']}
											onClick={() => navigate(`/dashboard/reports/${session.roomUuid}`)}
										>
											<td style={{ fontWeight: 600 }}>{session.quizName}</td>
											<td>
												{session.courseName
													? `${session.courseName}${session.groupName ? ` (${session.groupName})` : ''}`
													: (session.groupName ? `(${session.groupName})` : '—')}
											</td>
											<td>{session.participantsCount}</td>
											<td>{session.avgScore.toFixed(1)}</td>
											<td>{session.avgPercentage}%</td>
											<td>{formatDate(session.endedAt || session.createdAt)}</td>
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
