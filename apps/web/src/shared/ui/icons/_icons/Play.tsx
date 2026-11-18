import type { IconProps } from '../icons.types';

export function PlayIcon({ size = 20, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M6.5 4.4a1 1 0 0 1 1.53-.85l12 7.6a1 1 0 0 1 0 1.7l-12 7.6a1 1 0 0 1-1.53-.85V4.4Z" />
    </svg>
  );
}
