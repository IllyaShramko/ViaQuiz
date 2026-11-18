import type { IconProps } from '../icons.types';

/** Timer / stopwatch icon */
export function TimerIcon({ size = 18, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 29 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.45629 8.95833C4.29958 10.6864 3.625 12.7645 3.625 15C3.625 21.0061 8.49391 25.875 14.5 25.875C20.5061 25.875 25.375 21.0061 25.375 15C25.375 8.99391 20.5061 4.125 14.5 4.125V7.75M14.5 15L9.66667 10.1667"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
