import type { ParticipantRoundAnswerDto, QuestionVariantDto } from '@viaquiz/shared-types';

export interface StudentAnswerItem extends ParticipantRoundAnswerDto {
	totalScore: number;
}

export interface StudentAnswerCardProps {
	student: StudentAnswerItem;
	variants: QuestionVariantDto[];
	correctVariantIds: number[];
	animationDelaySec?: number;
}
