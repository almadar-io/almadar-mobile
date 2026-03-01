import { createContext, useContext } from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface RNTheme {
  colors: {
    primary: string;
    secondary: string;
    destructive: string;
    background: string;
    foreground: string;
    muted: string;
    'muted-foreground': string;
    border: string;
    card: string;
    'card-foreground': string;
    [key: string]: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    [key: string]: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    [key: string]: number;
  };
  button: {
    variants: Record<string, ViewStyle>;
    sizes: Record<string, ViewStyle>;
    text: Record<string, TextStyle>;
  };
}

export const defaultTheme: RNTheme = {
  colors: {
    primary: '#6366f1',
    secondary: '#e2e8f0',
    destructive: '#ef4444',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    border: '#e2e8f0',
    card: '#ffffff',
    'card-foreground': '#0f172a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  button: {
    variants: {
      primary: {
        backgroundColor: '#6366f1',
      },
      secondary: {
        backgroundColor: '#e2e8f0',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      destructive: {
        backgroundColor: '#ef4444',
      },
    },
    sizes: {
      sm: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
      },
      md: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
      },
      lg: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 10,
      },
    },
    text: {
      primary: {
        color: '#ffffff',
      },
      secondary: {
        color: '#1e293b',
      },
      ghost: {
        color: '#6366f1',
      },
      destructive: {
        color: '#ffffff',
      },
    },
  },
};

export const ThemeContext = createContext<RNTheme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);
