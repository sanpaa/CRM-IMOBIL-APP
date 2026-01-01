/**
 * Theme Model - Global Theme Configuration
 * Armazena as cores e estilos globais do site que podem ser usados nos componentes
 */

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  textLightColor: string;
  backgroundColor: string;
  backgroundDark: string;
  borderColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  linkColor: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
}

export interface ThemeSpacing {
  borderRadius: string;
  paddingSmall: string;
  paddingMedium: string;
  paddingLarge: string;
  marginSmall: string;
  marginMedium: string;
  marginLarge: string;
}

export interface VisualConfig {
  theme: ThemeColors;
  typography?: ThemeTypography;
  spacing?: ThemeSpacing;
}

export const DEFAULT_THEME: ThemeColors = {
  primaryColor: '#004AAD',
  secondaryColor: '#FFA500',
  accentColor: '#2c7a7b',
  textColor: '#333333',
  textLightColor: '#718096',
  backgroundColor: '#ffffff',
  backgroundDark: '#1a202c',
  borderColor: '#e2e8f0',
  successColor: '#10b981',
  errorColor: '#ef4444',
  warningColor: '#f59e0b',
  infoColor: '#3b82f6',
  linkColor: '#004AAD'
};

export const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '1rem',
  fontWeight: '400',
  lineHeight: '1.6'
};

export const DEFAULT_SPACING: ThemeSpacing = {
  borderRadius: '8px',
  paddingSmall: '0.5rem',
  paddingMedium: '1rem',
  paddingLarge: '2rem',
  marginSmall: '0.5rem',
  marginMedium: '1rem',
  marginLarge: '2rem'
};
