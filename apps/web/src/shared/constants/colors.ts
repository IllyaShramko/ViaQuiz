export const COLORS = {
  bg: '#0a0a0f',
  bgElevated: '#12121a',
  bgSurface: '#1a1a26',
  bgHover: '#22222e',

  border: '#2a2a3a',
  borderFocus: '#863bff',

  textPrimary: '#f0f0f5',
  textSecondary: '#9090a8',
  textMuted: '#606078',

  accent: '#863bff',
  accentHover: '#9b5cff',
  accentSubtle: 'rgba(134, 59, 255, 0.12)',

  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
} as const;

export type ColorKey = keyof typeof COLORS;
