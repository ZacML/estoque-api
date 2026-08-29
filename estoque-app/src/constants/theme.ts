/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Tokens do Design System Golinho — os mesmos valores do front Web
 * (src/styles.scss). Slate no escuro, verde operacional como ação primária,
 * Royal Blue como cor de informação, âmbar/vermelho como semânticas.
 */
export const Golinho = {
  light: {
    bg: '#f3f4f6',
    surface: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    muted: '#6b7280',
    primary: '#16a34a',
    primaryDark: '#15803d',
    primarySoft: '#dcfce7',
    blue: '#2563eb',
    blueSoft: '#dbeafe',
    amber: '#d97706',
    amberSoft: '#fef3c7',
    red: '#dc2626',
    redSoft: '#fee2e2',
    badge: '#111827',
    badgeText: '#ffffff',
  },
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    primary: '#16a34a',
    primaryDark: '#4ade80',
    primarySoft: 'rgba(34, 197, 94, 0.18)',
    blue: '#60a5fa',
    blueSoft: 'rgba(96, 165, 250, 0.18)',
    amber: '#fbbf24',
    amberSoft: 'rgba(251, 191, 36, 0.18)',
    red: '#f87171',
    redSoft: 'rgba(248, 113, 113, 0.18)',
    badge: '#334155',
    badgeText: '#ffffff',
  },
} as const;

export type GolinhoPalette = (typeof Golinho)['light'];

/** Raio, alturas de toque e escala tipográfica do coletor. */
export const Ui = {
  radius: 12,
  radiusSm: 8,
  touch: 56,
  font: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
