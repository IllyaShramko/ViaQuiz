import type { IconProps } from '../icons.types';

/** Red cross — shown after review when the student answered incorrectly */
export function IncorrectCrossIcon({ size = 22, width, height, ...props }: IconProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="-0.8 -0.8 17.60 17.60"
      fill="#F03C39"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 14.545L1.455 16 8 9.455 14.545 16 16 14.545 9.455 8 16 1.455 14.545 0 8 6.545 1.455 0 0 1.455 6.545 8z" fillRule="evenodd" />
    </svg>
  );
}
