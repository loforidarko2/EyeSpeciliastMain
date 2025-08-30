// Colors.ts - Theme color definitions
export const Colors = {
  light: {
    // Background colors
    background: '#f8f9fa',
    surface: '#ffffff',
    card: '#ffffff',

    // Text colors
    text: '#1a202c',
    textSecondary: '#555555',
    textMuted: '#999999',
    subtle: '#666666', // ✅ Added

    // Primary colors
    primary: '#1a73e8',
    primaryLight: '#4285f4',
    primaryDark: '#1557b0',

    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    danger: '#ef4444', // Same as error for consistency
    info: '#3b82f6',

    // Border and divider
    border: '#e5e7eb',
    divider: '#f3f4f6',

    // Icon colors
    icon: '#555555',
    iconMuted: '#999999',

    // Header
    headerBackground: '#ffffff',
    headerText: '#1a202c',
  },

  dark: {
    // Background colors
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',

    // Text colors
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    subtle: '#aaaaaa', // ✅ Added

    // Primary colors
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',

    // Status colors
    success: '#22c55e',
    warning: '#eab308',
    error: '#f87171',
    danger: '#f87171', // Same as error for consistency
    info: '#60a5fa',

    // Border and divider
    border: '#475569',
    divider: '#374151',

    // Icon colors
    icon: '#cbd5e1',
    iconMuted: '#94a3b8',

    // Header
    headerBackground: '#1e293b',
    headerText: '#f1f5f9',
  },
};

export type ColorScheme = keyof typeof Colors;

import { useColorScheme } from 'react-native';

// ✅ Simple hook to use colors directly based on system theme
export const useThemeColors = () => {
  const scheme = useColorScheme() as ColorScheme;
  return Colors[scheme ?? 'light'];
};

// ✅ Optional helper if needed outside components
export const getColorScheme = (): ColorScheme => {
  const scheme = useColorScheme();
  return (scheme === 'dark' ? 'dark' : 'light') as ColorScheme;
};

// Optional: Direct exports for manual usage
export const lightColors = Colors.light;
export const darkColors = Colors.dark;
