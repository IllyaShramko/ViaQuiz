export interface DateFilterBarProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onSubmit: () => void;
  onReset?: () => void;
  submitLabel?: string;
  resetLabel?: string;
  isLoading?: boolean;
  className?: string;
}
