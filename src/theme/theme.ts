import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Sabit Renkler
const brandColors = {
  primary: '#6C63FF',
  primaryDark: '#5046e5',
  primaryLight: '#8b84ff',
  secondary: '#00E5FF',
  success: '#22c55e',
  warning: '#FFB020',
  error: '#FF6584',
  errorDark: '#e11d48',
};

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    background: '#F4F7FA',
    surface: '#FFFFFF',
    surfaceVariant: '#f3f4f6',
    error: brandColors.error,
    onPrimary: '#FFFFFF',
    text: '#2D3436',
    onSurfaceVariant: '#4B5563',
    outline: 'rgba(0,0,0,0.05)',
    success: brandColors.success,
    warning: brandColors.warning,
    primaryDark: brandColors.primaryDark,
    errorDark: brandColors.errorDark,
    // Glassmorphism helpers
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
  },
  roundness: 12,
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8C85FF',
    secondary: '#00E5FF',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    error: '#FF8A9F',
    onPrimary: '#FFFFFF',
    text: '#FFFFFF',
    onSurfaceVariant: '#A1A1AA',
    outline: 'rgba(255,255,255,0.1)',
    success: '#22c55e',
    warning: '#FFB020',
    primaryDark: '#6C63FF',
    errorDark: '#FF6584',
    // Glassmorphism helpers
    glassBackground: 'rgba(30, 30, 30, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },
  roundness: 12,
};

// Ortak Gölgeler
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
