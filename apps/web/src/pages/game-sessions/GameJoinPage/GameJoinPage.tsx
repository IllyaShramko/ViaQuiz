import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
	useValidateJoinCodeMutation,
	useJoinGameRoomMutation,
	getGameSessionToken,
	saveGameSessionToken,
	removeGameSessionToken,
	PinCodeInput,
} from '../../../modules/game-session';
import {
	useUserContext,
	createLoginRedirectUrl,
	getUserDashboardPath,
} from '../../../modules/auth';
import { getAuthToken } from '../../../shared/api/headers';
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	LockIcon,
	LogoIcon,
	WarningIcon,
} from '../../../shared/ui/icons';
import styles from './GameJoinPage.module.css';

export function GameJoinPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { user } = useUserContext();
	const sanitizedUrlCode = (searchParams.get('code') || '').replace(/\D/g, '').slice(0, 6);

	const [prevUrlCode, setPrevUrlCode] = useState(sanitizedUrlCode);
	const [step, setStep] = useState<1 | 2>(1);
	const [joinCode, setJoinCode] = useState(sanitizedUrlCode);
	const [nickname, setNickname] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [requiresAuth, setRequiresAuth] = useState(false);

	// Sync local state cleanly when URL query parameter changes without an effect
	if (sanitizedUrlCode !== prevUrlCode) {
		setPrevUrlCode(sanitizedUrlCode);
		setJoinCode(sanitizedUrlCode);
		setStep(1);
		setErrorMessage(null);
		setRequiresAuth(false);
	}

	const [validateCode, { isLoading: isValidating }] = useValidateJoinCodeMutation();
	const [joinRoom, { isLoading: isJoining }] = useJoinGameRoomMutation();

	const autoProcessedCodeRef = useRef<string | null>(null);

	const validateAndProceed = useCallback(
		async (cleanCode: string) => {
			try {
				const res = await validateCode({ joinCode: cleanCode }).unwrap();
				const isLoggedIn = !!getAuthToken();

				// Join immediately if user already has an authenticated account session
				if (isLoggedIn) {
					const joinRes = await joinRoom({ joinCode: cleanCode }).unwrap();
					if (joinRes.token) {
						saveGameSessionToken(joinRes.room.uuid, joinRes.token);
					}
					navigate(`/game/play/${joinRes.room.uuid}`);
					return;
				}

				// Prompt login when room is restricted to enrolled classroom students
				if (res.requiresAuth) {
					setRequiresAuth(true);
					setErrorMessage(
						'Ця вікторина призначена лише для учнів класу. Увійдіть у свій акаунт, щоб приєднатися.',
					);
					return;
				}

				// Reuse stored anonymous session token for this room if still valid
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
						removeGameSessionToken(res.roomUuid);
					}
				}

				setErrorMessage(null);
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
		if (sanitizedUrlCode.length === 6 && autoProcessedCodeRef.current !== sanitizedUrlCode) {
			autoProcessedCodeRef.current = sanitizedUrlCode;
			void validateAndProceed(sanitizedUrlCode);
		}
	}, [sanitizedUrlCode, validateAndProceed]);

	const handleStepOneSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		const cleanCode = joinCode.trim();
		if (cleanCode.length < 6) {
			setErrorMessage('Введіть 6-значний PIN-код');
			return;
		}

		setErrorMessage(null);
		setRequiresAuth(false);
		await validateAndProceed(cleanCode);
	};

	const handlePinComplete = useCallback(
		(completedCode: string) => {
			if (isValidating || isJoining) return;
			setErrorMessage(null);
			setRequiresAuth(false);
			void validateAndProceed(completedCode);
		},
		[isValidating, isJoining, validateAndProceed],
	);

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

	const isStepOneBusy = isValidating || isJoining;
	const displayName =
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.firstName || user?.login || user?.email || '';

	return (
		<div className={styles.gameRoot}>
			<div className={styles.joinContainer}>
				<Link to="/" className={styles.logo}>
					<LogoIcon size={24} className={styles.logoIcon} />
					<span className={styles.logoText}>ViaQuiz</span>
				</Link>

				{step === 1 ? (
					<form onSubmit={handleStepOneSubmit} className={styles.card}>
						<div className={styles.header}>
							<h1 className={styles.title}>Приєднатися до тесту</h1>
							<p className={styles.subtitle}>
								Введіть 6-значний код від викладача або ведучого
							</p>
						</div>

						<PinCodeInput
							value={joinCode}
							onChange={(nextCode) => {
								setJoinCode(nextCode);
								setErrorMessage(null);
								setRequiresAuth(false);
							}}
							onComplete={handlePinComplete}
							hasError={Boolean(errorMessage && !requiresAuth)}
							disabled={isStepOneBusy}
							autoFocus={sanitizedUrlCode.length < 6}
						/>

						{errorMessage &&
							(requiresAuth ? (
								<div className={styles.authNotice} role="status">
									<LockIcon size={16} className={styles.authNoticeIcon} />
									<span>{errorMessage}</span>
								</div>
							) : (
								<div className={styles.errorBanner} role="alert">
									<WarningIcon size={16} className={styles.errorIcon} />
									<span>{errorMessage}</span>
								</div>
							))}

						{requiresAuth ? (
							<Link
								to={createLoginRedirectUrl(`/join?code=${joinCode.trim()}`, 'student')}
								className={styles.authRedirectBtn}
							>
								<span>Увійти в акаунт</span>
								<ArrowRightIcon size={16} />
							</Link>
						) : (
							<button
								type="submit"
								disabled={isStepOneBusy || joinCode.length < 6}
								className={`${styles.submitBtn} ${isStepOneBusy ? styles.submitBtnBusy : ''}`}
							>
								<span>{isStepOneBusy ? 'Перевірка...' : 'Продовжити'}</span>
								{!isStepOneBusy && <ArrowRightIcon size={16} />}
							</button>
						)}
					</form>
				) : (
					<form onSubmit={handleStepTwoSubmit} className={styles.card}>
						<div className={styles.stepMetaRow}>
							<button
								type="button"
								onClick={() => {
									setStep(1);
									setErrorMessage(null);
								}}
								className={styles.backBtn}
							>
								<ArrowLeftIcon size={15} />
								<span>Змінити код</span>
							</button>
							<span className={styles.codeBadge}>PIN {joinCode}</span>
						</div>

						<div className={styles.header}>
							<h1 className={styles.title}>Як вас звати?</h1>
							<p className={styles.subtitle}>
								Ім&apos;я бачитимуть викладач та інші учасники сесії
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
							className={`${styles.inputNickname} ${errorMessage ? styles.inputNicknameError : ''}`}
							autoFocus
						/>

						{errorMessage && (
							<div className={styles.errorBanner} role="alert">
								<WarningIcon size={16} className={styles.errorIcon} />
								<span>{errorMessage}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={isJoining || !nickname.trim()}
							className={`${styles.submitBtn} ${isJoining ? styles.submitBtnBusy : ''}`}
						>
							<span>{isJoining ? 'Вхід...' : 'Приєднатись'}</span>
							{!isJoining && <ArrowRightIcon size={16} />}
						</button>
					</form>
				)}

				<div className={styles.footerLinks}>
					{user ? (
						<>
							{displayName && (
								<>
									<span className={styles.footerUser}>{displayName}</span>
									<span className={styles.footerDivider} aria-hidden="true">
										·
									</span>
								</>
							)}
							<Link to={getUserDashboardPath(user)} className={styles.footerLink}>
								До кабінету
							</Link>
						</>
					) : (
						<>
							<Link to="/" className={styles.footerLink}>
								На головну
							</Link>
							<span className={styles.footerDivider} aria-hidden="true">
								·
							</span>
							<Link
								to={createLoginRedirectUrl('/join', 'student')}
								className={styles.footerLink}
							>
								Увійти в акаунт
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
