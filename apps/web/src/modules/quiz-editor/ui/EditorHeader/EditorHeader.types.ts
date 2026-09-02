import type { SaveStatus } from '../../models';

export interface EditorHeaderProps {
  quizName: string;
  saveStatus: SaveStatus;
  onNameChange: (name: string) => void;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
  isDraft: boolean;
  hasQuestions: boolean;
}
