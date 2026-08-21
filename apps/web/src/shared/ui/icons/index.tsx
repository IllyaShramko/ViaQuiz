import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AiIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="-0.16 -0.16 16.32 16.32"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z" />
  </svg>
);

export const ArrowIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
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

export const BinIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 -0.5 21 21"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="matrix(-1, 0, 0, 1, 21, 0)">
      <g transform="translate(-179, -360)">
        <g transform="translate(56, 160)">
          <path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z" />
        </g>
      </g>
    </g>
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 -960 960 960"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

export const EnterIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 -960 960 960"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M240-400h122l200-200q9-9 13.5-20.5T580-643q0-11-5-21.5T562-684l-36-38q-9-9-20-13.5t-23-4.5q-11 0-22.5 4.5T440-722L240-522v122Zm280-243-37-37 37 37ZM300-460v-38l101-101 20 18 18 20-101 101h-38Zm121-121 18 20-38-38 20 18Zm26 181h273v-80H527l-80 80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
  </svg>
);

export const MultipleIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 -960 960 960"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M655-200 513-342l56-56 85 85 170-170 56 57-225 226Zm0-320L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z" />
  </svg>
);
export const MultuipleIcon = MultipleIcon;

export const OneAnswerIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 -960 960 960"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m480-80-10-120h-10q-142 0-241-99t-99-241q0-142 99-241t241-99q71 0 132.5 26.5t108 73q46.5 46.5 73 108T800-540q0 75-24.5 144t-67 128q-42.5 59-101 107T480-80Zm80-146q71-60 115.5-140.5T720-540q0-109-75.5-184.5T460-800q-109 0-184.5 75.5T200-540q0 109 75.5 184.5T460-280h100v54Zm-101-95q17 0 29-12t12-29q0-17-12-29t-29-12q-17 0-29 12t-12 29q0 17 12 29t29 12Zm-29-127h60q0-30 6-42t38-44q18-18 30-39t12-45q0-51-34.5-76.5T460-720q-44 0-74 24.5T344-636l56 22q5-17 19-33.5t41-16.5q27 0 40.5 15t13.5 33q0 17-10 30.5T480-558q-35 30-42.5 47.5T430-448Zm30-65Z" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12H20M12 4V20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PublicIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
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

export const UploadIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H12"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.9997 13.5854L18.7569 13.3425L18.7422 13.3279C18.6785 13.2642 18.6249 13.2106 18.5777 13.1672C17.1476 11.8531 14.8649 12.2236 13.9237 13.9224C13.8926 13.9785 13.8587 14.0463 13.8185 14.1268L13.8185 14.1268L13.8092 14.1454L13.781 14.2016L13.7791 14.2054L13.7763 14.2022L13.7353 14.1545L8.75926 8.3491C8.39983 7.92978 7.76853 7.88122 7.34921 8.24064C6.92988 8.60006 6.88132 9.23136 7.24074 9.65069L12.2168 15.4561L12.2256 15.4664C12.2545 15.5001 12.2884 15.5397 12.3193 15.5727C13.246 16.5622 14.8679 16.3626 15.5269 15.1778C15.5489 15.1383 15.5722 15.0917 15.592 15.052L15.592 15.052L15.598 15.0399C15.6528 14.9304 15.6656 14.9052 15.6732 14.8916C15.9869 14.3253 16.7478 14.2019 17.2245 14.6399C17.2359 14.6504 17.2561 14.6702 17.3426 14.7568L18.9441 16.3582C18.9902 15.6404 18.9983 14.748 18.9997 13.5854Z"
      fill="currentColor"
    />
    <path
      d="M21 3V2H22V3H21ZM16.6247 7.78087C16.1934 8.12588 15.5641 8.05596 15.2191 7.62469C14.8741 7.19343 14.944 6.56414 15.3753 6.21913L16.6247 7.78087ZM20 8V3H22V8H20ZM21 4H16V2H21V4ZM21.6247 3.78087L16.6247 7.78087L15.3753 6.21913L20.3753 2.21913L21.6247 3.78087Z"
      fill="currentColor"
    />
  </svg>
);

export const ViewEyeIcon: React.FC<IconProps> = ({ size = 24, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.83 11.2807C19.542 7.15186 15.8122 5 12 5C8.18777 5 4.45796 7.15186 2.17003 11.2807C1.94637 11.6844 1.94361 12.1821 2.16029 12.5876C4.41183 16.8013 8.1628 19 12 19C15.8372 19 19.5882 16.8013 21.8397 12.5876C22.0564 12.1821 22.0536 11.6844 21.83 11.2807ZM12 17C9.06097 17 6.04052 15.3724 4.09173 11.9487C6.06862 8.59614 9.07319 7 12 7C14.9268 7 17.9314 8.59614 19.9083 11.9487C17.9595 15.3724 14.939 17 12 17Z"
      fill="currentColor"
    />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size = 20, width, height, ...props }) => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, width, height, ...props }) => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 20, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);

export const ExpandIcon: React.FC<IconProps> = ({ size = 18, width, height, ...props }) => (
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
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);


