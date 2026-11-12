import { useMemo, useState, type FormEvent } from 'react';
import type {
  PerformanceDateRange,
  PerformancePeriodPreset,
} from './PerformanceOverview.types';

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPresetRange(
  preset: Exclude<PerformancePeriodPreset, 'custom'>,
): PerformanceDateRange {
  if (preset === 'all') {
    return {};
  }

  const to = new Date();
  const from = new Date();
  const daysBack = preset === '7d' ? 6 : 29;
  from.setDate(to.getDate() - daysBack);

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  };
}

export function usePerformancePeriodFilter() {
  const [preset, setPreset] = useState<PerformancePeriodPreset>('all');
  const defaultCustomRange = useMemo(() => getPresetRange('30d'), []);
  const [customFrom, setCustomFrom] = useState(defaultCustomRange.from || '');
  const [customTo, setCustomTo] = useState(defaultCustomRange.to || '');
  const [appliedRange, setAppliedRange] = useState<PerformanceDateRange>({});

  const isCustomInvalid = Boolean(customFrom && customTo && customFrom > customTo);

  const onSelectPreset = (nextPreset: PerformancePeriodPreset) => {
    setPreset(nextPreset);
    if (nextPreset === 'custom') return;
    setAppliedRange(getPresetRange(nextPreset));
  };

  const onApplyCustom = (event: FormEvent) => {
    event.preventDefault();
    if (isCustomInvalid) return;
    setAppliedRange({
      ...(customFrom ? { from: customFrom } : {}),
      ...(customTo ? { to: customTo } : {}),
    });
  };

  return {
    preset,
    customFrom,
    customTo,
    appliedRange,
    isCustomInvalid,
    onSelectPreset,
    onCustomFromChange: setCustomFrom,
    onCustomToChange: setCustomTo,
    onApplyCustom,
  };
}
