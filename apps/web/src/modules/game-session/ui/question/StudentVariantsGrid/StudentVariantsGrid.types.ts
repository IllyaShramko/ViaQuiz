import type { QuestionVariantDto } from '@viaquiz/shared-types';

export interface StudentVariantsGridProps {
  variants: QuestionVariantDto[];
  isMulti: boolean;
  disabled?: boolean;
  onSubmit: (variantIds: number[]) => void;
}
