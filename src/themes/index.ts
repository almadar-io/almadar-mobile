/**
 * Theme exports for @almadar/mobile
 * Mirrors @almadar/ui theme structure
 */

export { almadarLight, almadarDark } from './almadar';

// Theme type that matches CSS variable names
export interface Theme {
  colors: {
    primary: string;
    'primary-hover': string;
    'primary-foreground': string;
    secondary: string;
    'secondary-hover': string;
    'secondary-foreground': string;
    accent: string;
    'accent-foreground': string;
    muted: string;
    'muted-foreground': string;
    background: string;
    foreground: string;
    card: string;
    'card-foreground': string;
    surface: string;
    border: string;
    input: string;
    ring: string;
    error: string;
    'error-foreground': string;
    success: string;
    'success-foreground': string;
    warning: string;
    'warning-foreground': string;
    info: string;
    'info-foreground': string;
    [key: string]: string;
  };
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  spacing: {
    [key: string]: number;
  };
  typography: {
    fontFamily: string;
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
    letterSpacing: number;
    lineHeight: number;
    sizes: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
    };
  };
  shadows: {
    [key: string]: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  transitions: {
    fast: number;
    normal: number;
    slow: number;
  };
  icon: {
    strokeWidth: number;
    color: string;
  };
}

// Re-export default theme
export { almadarLight as defaultTheme } from './almadar';
