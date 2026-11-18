import type { IconProps } from '../icons.types';

/** Downward chevron icon */
export function ChevronDownIcon({ size = 16, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
