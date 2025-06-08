import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    primaryContainer: '#E3F2FD',
    secondary: '#FF9500',
    secondaryContainer: '#FFF3E0',
    tertiary: '#34C759',
    error: '#FF3B30',
    errorContainer: '#FFEBEE',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    outline: '#6C757D',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onBackground: '#212529',
    onSurface: '#495057',
    onSurfaceVariant: '#6C757D',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};