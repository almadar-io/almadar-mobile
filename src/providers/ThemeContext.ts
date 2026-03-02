import { createContext, useContext } from 'react';

/**
 * React Native Theme Structure
 * Mirrors CSS variable names from @almadar/ui
 */
export interface RNTheme {
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

export const defaultTheme: RNTheme = {
  colors: {
    primary: '#14b8a6',
    'primary-hover': '#0d9488',
    'primary-foreground': '#ffffff',
    secondary: '#f1f5f9',
    'secondary-hover': '#e2e8f0',
    'secondary-foreground': '#0f172a',
    accent: '#06b6d4',
    'accent-foreground': '#ffffff',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    background: '#f8fafc',
    foreground: '#0f172a',
    card: '#ffffff',
    'card-foreground': '#0f172a',
    surface: '#f1f5f9',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#14b8a6',
    error: '#dc2626',
    'error-foreground': '#ffffff',
    success: '#16a34a',
    'success-foreground': '#ffffff',
    warning: '#ca8a04',
    'warning-foreground': '#000000',
    info: '#0ea5e9',
    'info-foreground': '#ffffff',
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },
  typography: {
    fontFamily: 'Inter',
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '600',
    },
    letterSpacing: -0.02,
    lineHeight: 1.6,
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    main: {
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  transitions: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  icon: {
    strokeWidth: 1.75,
    color: '#0d9488',
  },
};

export const ThemeContext = createContext<RNTheme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);
