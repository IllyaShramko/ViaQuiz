export interface TeacherHeroSearchProps {
  title?: string;
  placeholder?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}
