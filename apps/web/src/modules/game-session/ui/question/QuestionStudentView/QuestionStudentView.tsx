import { useState } from 'react';
import { AntiCheatOverlay } from '../AntiCheatOverlay';
import { ImageLightboxModal } from '../../modals';
import { TypeAnswerV1Input } from '../TypeAnswerV1Input';
import { TypeAnswerV2Input } from '../TypeAnswerV2Input';
import { StudentVariantsGrid } from '../StudentVariantsGrid';
import type { QuestionStudentViewProps } from './QuestionStudentView.types';
import styles from './QuestionStudentView.module.css';

const QUESTION_HINT_BY_TYPE: Record<string, string> = {
	MANY_ANSWERS: 'Оберіть декілька правильних варіантів',
	TYPE_ANSWER_V1: 'Введіть вашу відповідь у поле нижче',
	TYPE_ANSWER_V2: 'Введіть відповідь по буквах (дужки вже підставлені)',
};

export function QuestionStudentView(props: QuestionStudentViewProps) {
	const { question } = props;
	const questionKey = String(
		(question as { questionId?: number; id?: number }).questionId ??
			(question as { questionId?: number; id?: number }).id ??
			question.text ??
			question.questionIndex ??
			'',
	);

	return <QuestionStudentViewInner key={questionKey} {...props} />;
}

function QuestionStudentViewInner({
	question,
	alreadyAnswered,
	onSubmitAnswer,
}: QuestionStudentViewProps) {
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);

	const handleOpenLightbox = (url?: string | null) => {
		if (!url) return;
		setLightboxImage(url);
		setIsLightboxOpen(true);
	};

	const isMulti = question.type === 'MANY_ANSWERS';
	const isTypeV2 = question.type === 'TYPE_ANSWER_V2';
	const isTyped = question.type === 'TYPE_ANSWER_V1' || isTypeV2;
	const hasAnswerMask =
		isTypeV2 && typeof question.answerMask === 'string' && question.answerMask.length > 0;
	const hintText = QUESTION_HINT_BY_TYPE[question.type];

	return (
		<div className={styles.gameMainContent}>
			{alreadyAnswered && <AntiCheatOverlay />}

			<div className={`${styles.questionContainer} ${alreadyAnswered ? styles.isBlurred : ''}`}>
				<div className={styles.questionHeaderCard}>
					<h2 className={styles.questionText}>{question.text}</h2>

					{question.media && (
						<img
							src={question.media}
							alt="Медіа запитання"
							className={styles.questionMediaImg}
							onClick={() => handleOpenLightbox(question.media)}
						/>
					)}

					{hintText && <p className={styles.questionMultiHint}>{hintText}</p>}
				</div>

				{isTyped ? (
					hasAnswerMask ? (
						<TypeAnswerV2Input
							mask={question.answerMask!}
							disabled={alreadyAnswered}
							onSubmit={(assembledAnswer) => onSubmitAnswer(undefined, assembledAnswer)}
						/>
					) : (
						<TypeAnswerV1Input
							disabled={alreadyAnswered}
							onSubmit={(typedAnswer) => onSubmitAnswer(undefined, typedAnswer)}
						/>
					)
				) : (
					<StudentVariantsGrid
						variants={question.variants || []}
						isMulti={isMulti}
						disabled={alreadyAnswered}
						onSubmit={(variantIds) => onSubmitAnswer(variantIds)}
					/>
				)}
			</div>

			<ImageLightboxModal
				isOpen={isLightboxOpen}
				imageUrl={lightboxImage}
				onClose={() => setIsLightboxOpen(false)}
				onAfterClose={() => setLightboxImage(null)}
			/>
		</div>
	);
}
