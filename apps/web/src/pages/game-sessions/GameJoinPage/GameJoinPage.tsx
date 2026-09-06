import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
	useValidateJoinCodeMutation,
	useJoinGameRoomMutation,
	getGameSessionToken,
	saveGameSessionToken,
	removeGameSessionToken,
} from '../../../modules/game-session';
import { createLoginRedirectUrl } from '../../../modules/auth';
import { getAuthToken } from '../../../shared/api/headers';
import { LogoIcon } from '../../../shared/ui/icons';
import styles from './GameJoinPage.module.css';

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

				// If the user is already authenticated (student/teacher), join immediately
				if (isLoggedIn) {
					const joinRes = await joinRoom({ joinCode: cleanCode }).unwrap();
					if (joinRes.token) {
						saveGameSessionToken(joinRes.room.uuid, joinRes.token);
					}
					navigate(`/game/play/${joinRes.room.uuid}`);
					return;
				}

				// If not authenticated and room requires classroom account
				if (res.requiresAuth) {
					setRequiresAuth(true);
					setErrorMessage(
						'Ця вікторина призначена виключно для учнів класу. Будь ласка, увійдіть у свій акаунт.',
					);
					return;
				}

				// If open guest quiz, check if an active game token already exists for this room
				const existingToken = getGameSessionToken(res.roomUuid);
				if (existingToken) {
					try {
						const joinRes = await joinRoom({
							joinCode: cleanCode,
							gameToken: existingToken,
						}).unwrap();

						if (joinRes.token) {
							saveGameSessionToken(joinRes.room.uuid, joinRes.token);
						}
						navigate(`/game/play/${joinRes.room.uuid}`);
						return;
					} catch {
						// If stored token is invalid or expired, remove it
						removeGameSessionToken(res.roomUuid);
					}
				}

				// If no valid token exists, proceed to step 2 (enter nickname)
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
	const handleStepOneSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		await processJoinCode(joinCode);
	};

	// Step 2: Guest joins with Nickname
	const handleStepTwoSubmit = async (e: React.SyntheticEvent) => {
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
				saveGameSessionToken(res.room.uuid, res.token);
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
		<div className={styles.gameRoot}>
			<div className={styles.joinContainer}>
				<Link to="/" className={styles.logo}>
					<LogoIcon size={28} className={styles.logoIcon} />
					<span className={styles.logoText}>ViaQuiz</span>
				</Link>

				{step === 1 ? (
					/* Step 1: Enter PIN code */
					<form onSubmit={handleStepOneSubmit} className={styles.card}>
						<h1 className={styles.title}>Введіть код</h1>

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
							className={styles.inputPin}
							autoFocus
						/>

						{errorMessage && (
							<div className={styles.errorMessage}>
								{errorMessage}
							</div>
						)}

						{requiresAuth ? (
							<Link
								to={createLoginRedirectUrl(`/join?code=${joinCode.trim()}`, 'student')}
								className={styles.authRedirectBtn}
							>
								Увійти в акаунт
							</Link>
						) : (
							<button
								type="submit"
								disabled={isValidating || isJoining || joinCode.length < 6}
								className={styles.submitBtn}
							>
								{isValidating || isJoining ? 'Перевірка...' : 'ПРИЄДНАТИСЬ'}
							</button>
						)}
					</form>
				) : (
					/* Step 2: Enter nickname (guest only) */
					<form onSubmit={handleStepTwoSubmit} className={styles.card}>
						<button
							type="button"
							onClick={() => {
								setStep(1);
								setErrorMessage(null);
							}}
							className={styles.backBtn}
						>
							← Змінити код ({joinCode})
						</button>

						<div>
							<h1 className={styles.title}>Як вас звати?</h1>
							<p className={styles.subtitle}>
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
							className={styles.inputNickname}
							autoFocus
						/>

						{errorMessage && (
							<div className={styles.errorMessage}>
								{errorMessage}
							</div>
						)}

						<button
							type="submit"
							disabled={isJoining || !nickname.trim()}
							className={styles.submitBtn}
						>
							{isJoining ? 'Вхід...' : 'ПРИЄДНАТИСЬ'}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
