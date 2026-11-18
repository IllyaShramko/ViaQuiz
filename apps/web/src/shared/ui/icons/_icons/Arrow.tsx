import type { IconProps } from '../icons.types';

export function ArrowIcon({ size = 24, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15.975 22L17.75 20.225L9.525 12L17.75 3.775L15.975 2L5.975 12L15.975 22Z" />
    </svg>
  );
}
