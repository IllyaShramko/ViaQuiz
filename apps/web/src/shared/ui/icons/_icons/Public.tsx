import type { IconProps } from '../icons.types';

export function PublicIcon({ size = 24, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 96 96"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M90,60a5.9966,5.9966,0,0,0-6,6V84H12V12H30A6,6,0,0,0,30,0H6A5.9966,5.9966,0,0,0,0,6V90a5.9966,5.9966,0,0,0,6,6H90a5.9966,5.9966,0,0,0,6-6V66A5.9966,5.9966,0,0,0,90,60Z" />
      <path d="M90,0H66a6,6,0,0,0,0,12h9.5156L37.7578,49.7578a5.9994,5.9994,0,1,0,8.4844,8.4844L84,20.4844V30a6,6,0,0,0,12,0V6A5.9966,5.9966,0,0,0,90,0Z" />
    </svg>
  );
}
