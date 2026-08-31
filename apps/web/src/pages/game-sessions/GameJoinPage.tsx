import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
	useValidateJoinCodeMutation,
	useJoinGameRoomMutation,
	GAME_TOKEN_STORAGE_KEY,
} from '../../modules/game-session';
import { createLoginRedirectUrl } from '../../modules/auth';
import { getAuthToken } from '../../shared/api/headers';
import { LogoIcon } from '../../shared/ui/icons';
import styles from '../../modules/game-session/ui/GameSession.module.css';

export function GameJoinPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const codeFromUrl = searchParams.get('code') || '';

	const [step, setStep] = useState<1 | 2>(1);
	const [joinCode, setJoinCode] = useState(codeFromUrl);
	const [nickname, setNickname] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [requiresAuth, setRequiresAuth] = useState(false);

	const [validateCode, { isLoading: isValidating }] = useValidateJoinCodeMutation();
	const [joinRoom, { isLoading: isJoining }] = useJoinGameRoomMutation();

	const autoProcessedCodeRef = useRef<string | null>(null);

	const processJoinCode = useCallback(
		async (codeToProcess: string) => {
			const cleanCode = codeToProcess.trim();
			if (cleanCode.length < 6) {
				setErrorMessage('Введіть 6-значний PIN код');
				return;
			}

			setErrorMessage(null);
			try {
				const res = await validateCode({ joinCode: cleanCode }).unwrap();

				const isLoggedIn = !!getAuthToken();

				// Якщо користувач уже авторизований (учень/вчитель) — одразу приєднуємо!
				if (isLoggedIn) {
					const joinRes = await joinRoom({ joinCode: cleanCode }).unwrap();
					if (joinRes.token) {
						sessionStorage.setItem(`viaquiz_game_token_${joinRes.room.uuid}`, joinRes.token);
						sessionStorage.setItem(GAME_TOKEN_STORAGE_KEY, joinRes.token);
					}
					navigate(`/game/play/${joinRes.room.uuid}`);
					return;
				}

				// Якщо не авторизований, але кімната вимагає акаунт класу
				if (res.requiresAuth) {
					setRequiresAuth(true);
					setErrorMessage(
						'Ця вікторина призначена виключно для учнів класу. Будь ласка, увійдіть у свій акаунт.',
					);
					return;
				}

				// Якщо відкрита вікторина для гостей — переходимо на крок 2 (введення імені)
				setStep(2);
			} catch (err: unknown) {
				const error = err as { data?: { message?: string } };
				setErrorMessage(
					error.data?.message || 'Невірний PIN-код або сесія вже завершена.',
				);
			}
		},
		[validateCode, joinRoom, navigate],
	);

	useEffect(() => {
		if (codeFromUrl) {
			setJoinCode(codeFromUrl);
			const clean = codeFromUrl.trim();
			if (clean.length === 6 && autoProcessedCodeRef.current !== clean) {
				autoProcessedCodeRef.current = clean;
				processJoinCode(clean);
			}
		}
	}, [codeFromUrl, processJoinCode]);

	// Step 1: Validate PIN code manually
	const handleStepOneSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await processJoinCode(joinCode);
	};

	// Step 2: Guest joins with Nickname
	const handleStepTwoSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const cleanNick = nickname.trim();
		if (!cleanNick) {
			setErrorMessage("Введіть ваше ім'я");
			return;
		}

		setErrorMessage(null);
		try {
			const res = await joinRoom({
				joinCode: joinCode.trim(),
				nickname: cleanNick,
			}).unwrap();

			if (res.token) {
				sessionStorage.setItem(`viaquiz_game_token_${res.room.uuid}`, res.token);
				sessionStorage.setItem(GAME_TOKEN_STORAGE_KEY, res.token);
			}

			navigate(`/game/play/${res.room.uuid}`);
		} catch (err: unknown) {
			const error = err as { data?: { message?: string } };
			setErrorMessage(
				error.data?.message ||
					'Не вдалося приєднатися. Перевірте код або спробуйте пізніше.',
			);
		}
	};

	return (
		<div className={styles['game-root']}>
			<header className={styles['game-topbar']}>
				<Link to="/" className={styles['game-logo']}>
					<LogoIcon size={24} className={styles['game-logo-icon']} />
					<span>ViaQuiz</span>
				</Link>
			</header>

			<div className={styles['game-main-content']}>
				{step === 1 ? (
					/* Step 1: Enter PIN code */
					<form onSubmit={handleStepOneSubmit} className={styles['join-pin-card']}>
						<h1 className={styles['join-pin-title']}>Введіть код</h1>

						<input
							type="text"
							maxLength={6}
							placeholder="000000"
							value={joinCode}
							onChange={(e) => {
								setJoinCode(e.target.value.replace(/\D/g, ''));
								setErrorMessage(null);
								setRequiresAuth(false);
							}}
							className={styles['join-pin-input']}
							autoFocus
						/>

						{errorMessage && (
							<div
								style={{
									color: 'var(--color-error, #ef4444)',
									fontSize: '0.9rem',
									fontWeight: 600,
									lineHeight: 1.4,
								}}
							>
								{errorMessage}
							</div>
						)}

						{requiresAuth ? (
							<Link
								to={createLoginRedirectUrl(`/join?code=${joinCode.trim()}`, 'student')}
								className={styles['lobby-start-btn']}
								style={{ width: '100%', textDecoration: 'none' }}
							>
								Увійти в акаунт
							</Link>
						) : (
							<button
								type="submit"
								disabled={isValidating || isJoining || joinCode.length < 6}
								className={styles['join-submit-btn']}
							>
								{isValidating || isJoining ? 'Перевірка...' : 'ПРИЄДНАТИСЬ'}
							</button>
						)}
					</form>
				) : (
					/* Step 2: Enter nickname (guest only) */
					<form onSubmit={handleStepTwoSubmit} className={styles['join-pin-card']}>
						<button
							type="button"
							onClick={() => {
								setStep(1);
								setErrorMessage(null);
							}}
							style={{
								alignSelf: 'flex-start',
								color: 'var(--color-text-secondary, #9090a8)',
								fontSize: '0.875rem',
								fontWeight: 600,
								display: 'flex',
								alignItems: 'center',
								gap: '0.35rem',
								marginBottom: '-0.5rem',
							}}
						>
							← Змінити код ({joinCode})
						</button>

						<div>
							<h1 className={styles['join-pin-title']}>Як вас звати?</h1>
							<p
								style={{
									color: 'var(--color-text-secondary, #9090a8)',
									fontSize: '0.875rem',
									marginTop: '0.25rem',
								}}
							>
								Введіть ім'я, яке бачитимуть викладач та інші учасники
							</p>
						</div>

						<input
							type="text"
							maxLength={30}
							placeholder="Ваше ім'я або нікнейм"
							value={nickname}
							onChange={(e) => {
								setNickname(e.target.value);
								setErrorMessage(null);
							}}
							className={styles['join-nickname-input']}
							autoFocus
						/>

						{errorMessage && (
							<div
								style={{
									color: 'var(--color-error, #ef4444)',
									fontSize: '0.9rem',
									fontWeight: 600,
								}}
							>
								{errorMessage}
							</div>
						)}

						<button
							type="submit"
							disabled={isJoining || !nickname.trim()}
							className={styles['join-submit-btn']}
						>
							{isJoining ? 'Вхід...' : 'ПРИЄДНАТИСЬ'}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
