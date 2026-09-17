import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetClassroomsQuery } from '../../../classes/api/classesApi';
import { useCreateRoomMutation } from '../../../game-session/api/gameSessionApi';
import type { QuizLaunchCardProps } from './QuizLaunchCard.types';
import { PlayIcon } from '../../../../shared/ui/icons';

export function QuizLaunchCard({ quiz }: QuizLaunchCardProps) {
	const navigate = useNavigate();
	const { data: classroomsData, isLoading: isClassroomsLoading } =
		useGetClassroomsQuery(undefined, {
			refetchOnMountOrArgChange: true,
		});
	const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();

	const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	const classrooms = classroomsData?.classrooms || [];

	const handleStartQuiz = async () => {
		setError(null);
		try {
			const room = await createRoom({
				quizId: quiz.id,
				courseId: selectedCourseId,
			}).unwrap();

			navigate(`/game/host/${room.uuid}`);
		} catch (err: unknown) {
			const e = err as { data?: { message?: string } };
			setError(e.data?.message || 'Не вдалося розпочати вікторину');
		}
	};

	return (
		<section
			style={{
				backgroundColor: 'var(--color-bg-elevated, #12121a)',
				border: '1px solid var(--color-border, #2a2a3a)',
				borderRadius: 'var(--radius-xl, 0.75rem)',
				padding: '1.25rem 1.75rem',
				display: 'flex',
				flexDirection: 'column',
				gap: '0.75rem',
				boxShadow: 'var(--shadow-md)',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					gap: '1rem',
				}}
			>
				<div>
					<h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
						Провести вікторину в реальному часі
					</h3>
					<p
						style={{
							color: 'var(--color-text-secondary, #9090a8)',
							fontSize: '0.85rem',
							margin: '0.2rem 0 0 0',
						}}
					>
						Створіть кімнату з 6-значним PIN-кодом або призначте для конкретного класу
					</p>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
					{/* Dropdown select class / course */}
					<select
						value={selectedCourseId ?? ''}
						disabled={isClassroomsLoading || isCreating}
						onChange={(e) =>
							setSelectedCourseId(e.target.value ? Number(e.target.value) : null)
						}
						style={{
							background: 'var(--color-bg-surface, #1a1a26)',
							color: '#fff',
							border: '1px solid var(--color-border, #2a2a3a)',
							borderRadius: 'var(--radius-lg, 0.5rem)',
							padding: '0.55rem 0.85rem',
							fontSize: '0.9rem',
							outline: 'none',
							cursor: 'pointer',
							minWidth: '220px',
						}}
					>
						<option value="">Без класу (для всіх)</option>
						{classrooms.map((cls) => {
							const courses = cls.courses || [];
							if (courses.length === 0) {
								return (
									<optgroup key={cls.id} label={`Клас: ${cls.name}`}>
										<option disabled value="">
											(Немає курсів у класі)
										</option>
									</optgroup>
								);
							}
							return (
								<optgroup key={cls.id} label={`Клас: ${cls.name}`}>
									{courses.map((course) => (
										<option key={course.id} value={course.id}>
											{course.name}
										</option>
									))}
								</optgroup>
							);
						})}
					</select>

					{/* Start live quiz button */}
					<button
						type="button"
						disabled={isCreating}
						onClick={handleStartQuiz}
						style={{
							background: 'var(--color-accent, #863bff)',
							color: '#fff',
							fontWeight: 700,
							fontSize: '0.95rem',
							padding: '0.55rem 1.25rem',
							borderRadius: 'var(--radius-lg, 0.5rem)',
							boxShadow: '0 4px 15px rgba(134, 59, 255, 0.35)',
							display: 'flex',
							alignItems: 'center',
							gap: '0.45rem',
							transition: 'all var(--transition-fast)',
							cursor: isCreating ? 'not-allowed' : 'pointer',
						}}
					>
						<PlayIcon size={14} />
						<span>{isCreating ? 'Створення...' : 'Почати вікторину'}</span>
					</button>
				</div>
			</div>

			{error && (
				<div style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.825rem', fontWeight: 600 }}>
					{error}
				</div>
			)}
		</section>
	);
}
