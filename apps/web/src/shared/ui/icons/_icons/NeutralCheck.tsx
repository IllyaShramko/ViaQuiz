import type { IconProps } from '../icons.types';

/** Neutral white checkmark — shown when a student has answered (correctness unknown yet) */
export function NeutralCheckIcon({ size = 22, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="-16.79 -16.79 369.34 369.34"
      fill="#ffffff"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <polygon points="311.757,41.803 107.573,245.96 23.986,162.364 0,186.393 107.573,293.962 335.765,65.795" />
    </svg>
  );
}
