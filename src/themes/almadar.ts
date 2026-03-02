/**
 * Almadar Theme for React Native
 * Mirrors CSS variable names from @almadar/ui for cross-platform consistency
 */

import { RNTheme } from '../providers/ThemeContext';

export const almadarLight: RNTheme = {
  // Colors - matching CSS variable names
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
    border: 'rgba(20, 184, 166, 0.3)',
    input: 'rgba(20, 184, 166, 0.2)',
    ring: '#14b8a6',

    error: '#dc2626',
    'error-foreground': '#ffffff',
    success: '#16a34a',
    'success-foreground': '#ffffff',
    warning: '#ca8a04',
    'warning-foreground': '#000000',
    info: '#0ea5e9',
    'info-foreground': '#ffffff',

    // Additional colors for mobile
    'border-solid': '#e2e8f0',
    'border-teal': 'rgba(20, 184, 166, 0.3)',
    'input-bg': 'rgba(20, 184, 166, 0.1)',
  },

  // Border radius - matching CSS variables
  borderRadius: {
    none: 0,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },

  // Spacing
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

  // Typography
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

  // Shadows (React Native elevation/shadows)
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: 'rgba(20, 184, 166, 0.08)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    main: {
      shadowColor: 'rgba(20, 184, 166, 0.12)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 14,
      elevation: 4,
    },
    lg: {
      shadowColor: 'rgba(20, 184, 166, 0.18)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 8,
    },
    hover: {
      shadowColor: 'rgba(20, 184, 166, 0.2)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 40,
      elevation: 12,
    },
  },

  // Transitions (for animated components)
  transitions: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  // Icon styling
  icon: {
    strokeWidth: 1.75,
    color: '#0d9488',
  },
};

export const almadarDark: RNTheme = {
  colors: {
    primary: '#14b8a6',
    'primary-hover': '#2dd4bf',
    'primary-foreground': '#042f2e',

    secondary: '#1e293b',
    'secondary-hover': '#334155',
    'secondary-foreground': '#f1f5f9',

    accent: '#06b6d4',
    'accent-foreground': '#083344',

    muted: '#1e293b',
    'muted-foreground': '#94a3b8',

    background: '#0f172a',
    foreground: '#f1f5f9',
    card: '#1e293b',
    'card-foreground': '#f1f5f9',
    surface: '#1e293b',
    border: 'rgba(20, 184, 166, 0.25)',
    input: 'rgba(20, 184, 166, 0.3)',
    ring: '#14b8a6',

    error: '#f87171',
    'error-foreground': '#000000',
    success: '#4ade80',
    'success-foreground': '#000000',
    warning: '#fbbf24',
    'warning-foreground': '#000000',
    info: '#38bdf8',
    'info-foreground': '#000000',

    'border-solid': '#334155',
    'border-teal': 'rgba(20, 184, 166, 0.25)',
    'input-bg': 'rgba(20, 184, 166, 0.15)',
  },

  borderRadius: almadarLight.borderRadius,
  spacing: almadarLight.spacing,
  typography: almadarLight.typography,

  shadows: {
    none: almadarLight.shadows.none,
    sm: {
      shadowColor: 'rgba(20, 184, 166, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    main: {
      shadowColor: 'rgba(20, 184, 166, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 14,
      elevation: 4,
    },
    lg: {
      shadowColor: 'rgba(20, 184, 166, 0.25)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 8,
    },
    hover: {
      shadowColor: 'rgba(20, 184, 166, 0.35)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 40,
      elevation: 12,
    },
  },

  transitions: almadarLight.transitions,

  icon: {
    strokeWidth: 1.75,
    color: '#14b8a6',
  },
};
