import type { ReactNode } from 'react';

export interface AuthCardProps {
  title: string;
  subtitle: string;
  serverError?: string | null;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
  isWide?: boolean;
  children: ReactNode;
}
