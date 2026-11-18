import { AiIcon } from './_icons/Ai';
import { ArrowIcon } from './_icons/Arrow';
import { ArrowLeftIcon } from './_icons/ArrowLeft';
import { ArrowRightIcon } from './_icons/ArrowRight';
import { BinIcon } from './_icons/Bin';
import { CalendarIcon } from './_icons/Calendar';
import { CheckIcon } from './_icons/Check';
import { ChevronDownIcon } from './_icons/ChevronDown';
import { ClipboardIcon } from './_icons/Clipboard';
import { ClockIcon } from './_icons/Clock';
import { CloseIcon } from './_icons/Close';
import { CopyIcon } from './_icons/Copy';
import { CorrectCheckIcon } from './_icons/CorrectCheck';
import { EditIcon } from './_icons/Edit';
import { EnterIcon } from './_icons/Enter';
import { ExpandIcon } from './_icons/Expand';
import { HeartIcon } from './_icons/Heart';
import { HourglassIcon } from './_icons/Hourglass';
import { IncorrectCrossIcon } from './_icons/IncorrectCross';
import { KeyboardIcon } from './_icons/Keyboard';
import { LockIcon } from './_icons/Lock';
import { LogoIcon } from './_icons/Logo';
import { LogoutIcon } from './_icons/Logout';
import { MailIcon } from './_icons/Mail';
import { MultipleIcon } from './_icons/Multiple';
import { NeutralCheckIcon } from './_icons/NeutralCheck';
import { NextIcon } from './_icons/Next';
import { OneAnswerIcon } from './_icons/OneAnswer';
import { PlayIcon } from './_icons/Play';
import { PlusIcon } from './_icons/Plus';
import { PublicIcon } from './_icons/Public';
import { SettingsIcon } from './_icons/Settings';
import { SparkleIcon } from './_icons/Sparkle';
import { StarIcon } from './_icons/Star';
import { TimerIcon } from './_icons/Timer';
import { UploadIcon } from './_icons/Upload';
import { UserIcon } from './_icons/User';
import { UsersIcon } from './_icons/Users';
import { ViewEyeIcon } from './_icons/ViewEye';
import { ViewEyeOffIcon } from './_icons/ViewEyeOff';
import { WarningIcon } from './_icons/Warning';

export const ICONS = {
  AiIcon,
  ArrowIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BinIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  CorrectCheckIcon,
  EditIcon,
  EnterIcon,
  ExpandIcon,
  HeartIcon,
  HourglassIcon,
  IncorrectCrossIcon,
  KeyboardIcon,
  LockIcon,
  LogoIcon,
  LogoutIcon,
  MailIcon,
  MultipleIcon,
  NeutralCheckIcon,
  NextIcon,
  OneAnswerIcon,
  PlayIcon,
  PlusIcon,
  PublicIcon,
  SettingsIcon,
  SparkleIcon,
  StarIcon,
  TimerIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
  ViewEyeIcon,
  ViewEyeOffIcon,
  WarningIcon,
} as const;

export type IconName = keyof typeof ICONS;
