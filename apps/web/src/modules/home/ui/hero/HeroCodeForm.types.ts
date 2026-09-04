export { heroCodeSchema, type HeroCodeFormData } from '../../models/validators';

export interface HeroCodeFormProps {
  onSubmitCode?: (code: string) => void;
}
