import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { QrCodeModal } from '../../modals';
import { Button } from '../../../../../shared/ui';
import { CopyIcon, CheckIcon, PlayIcon } from '../../../../../shared/ui/icons';
import { copyToClipboard } from '../../../../../shared/tools';
import { getShareableOrigin } from '../../../../../shared/constants';
import type { HostLobbyProps } from './HostLobby.types';
import styles from './HostLobby.module.css';

export function HostLobby({
	joinCode,
	quizName,
	totalQuestions,
	onStartGame,
}: HostLobbyProps) {
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [isUrlCopied, setIsUrlCopied] = useState(false);
	const [isCodeCopied, setIsCodeCopied] = useState(false);
	const urlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const codeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const joinUrl = `${getShareableOrigin()}/join?code=${joinCode}`;
	const digits = joinCode.split('');

	useEffect(() => {
		return () => {
			if (urlTimeoutRef.current) {
				clearTimeout(urlTimeoutRef.current);
			}
			if (codeTimeoutRef.current) {
				clearTimeout(codeTimeoutRef.current);
			}
		};
	}, []);

	const handleCopy = async (text: string, type: 'url' | 'code') => {
		const success = await copyToClipboard(text);
		if (!success) return;

		if (type === 'url') {
			setIsUrlCopied(true);
			if (urlTimeoutRef.current) {
				clearTimeout(urlTimeoutRef.current);
			}
			urlTimeoutRef.current = setTimeout(() => {
				setIsUrlCopied(false);
				urlTimeoutRef.current = null;
			}, 2000);
		} else {
			setIsCodeCopied(true);
			if (codeTimeoutRef.current) {
				clearTimeout(codeTimeoutRef.current);
			}
			codeTimeoutRef.current = setTimeout(() => {
				setIsCodeCopied(false);
				codeTimeoutRef.current = null;
			}, 2000);
		}
	};

	return (
		<div className={styles.stage}>
			<div className={styles.card}>
				<div className={styles.cardHeader}>
					<div className={styles.quizMeta}>
						<span className={styles.eyebrow}>Кімната очікування</span>
						<h1 className={styles.quizTitle}>{quizName || 'Вікторина'}</h1>
					</div>
					{typeof totalQuestions === 'number' && totalQuestions > 0 && (
						<span className={styles.questionsBadge}>{totalQuestions} запитань</span>
					)}
				</div>

				<div className={styles.grid}>
					<div className={styles.leftColumn}>
						<div className={styles.fieldGroup}>
							<span className={styles.fieldLabel}>1. Відкрийте посилання</span>
							<div className={styles.fieldSurface}>
								<Link to={joinUrl} target="_blank" className={styles.urlLink}>
									joinviaquiz.com
								</Link>
								<button
									type="button"
									className={`${styles.copyBtn} ${isUrlCopied ? styles.isCopied : ''}`}
									onClick={() => handleCopy(joinUrl, 'url')}
									title={isUrlCopied ? 'Скопійовано!' : 'Скопіювати посилання'}
									aria-label="Скопіювати посилання"
								>
									{isUrlCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
								</button>
							</div>
						</div>

						<div className={styles.fieldGroup}>
							<span className={styles.fieldLabel}>2. Або введіть код кімнати</span>
							<div
								className={styles.pinSurface}
								onClick={() => handleCopy(joinCode, 'code')}
								role="button"
								tabIndex={0}
								title={isCodeCopied ? 'Скопійовано!' : 'Натисніть, щоб скопіювати код'}
								aria-label={`Код підключення ${joinCode}. Натисніть, щоб скопіювати`}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleCopy(joinCode, 'code');
									}
								}}
							>
								<div className={styles.pinDigits}>
									{digits.map((digit, index) => (
										<span key={index} className={styles.pinDigit}>
											{digit}
										</span>
									))}
								</div>
								<span className={`${styles.copyBtn} ${isCodeCopied ? styles.isCopied : ''}`}>
									{isCodeCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
								</span>
							</div>
						</div>

						<div className={styles.actions}>
							<Button
								type="button"
								variant="primary"
								size="md"
								fullWidth
								onClick={onStartGame}
								className={styles.startButton}
							>
								<PlayIcon size={18} />
								<span>Почати вікторину</span>
							</Button>
						</div>
					</div>

					<div className={styles.rightColumn}>
						<button
							type="button"
							className={styles.qrCardButton}
							onClick={() => setIsQrModalOpen(true)}
							title="Натисніть, щоб збільшити QR-код"
							aria-label="Збільшити QR-код"
						>
							<div className={styles.qrFrame}>
								<QRCodeSVG
									value={joinUrl}
									size={172}
									level="Q"
									className={styles.qrSvg}
								/>
							</div>
							<span className={styles.qrHint}>Збільшити QR-код</span>
						</button>
					</div>
				</div>
			</div>

			<QrCodeModal
				isOpen={isQrModalOpen}
				onClose={() => setIsQrModalOpen(false)}
				joinUrl={joinUrl}
				joinCode={joinCode}
			/>
		</div>
	);
}
