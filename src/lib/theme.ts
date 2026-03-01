import { ViewStyle, TextStyle } from 'react-native';

// Web theme structure (from @almadar/ui)
export interface WebTheme {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// RN theme structure
export interface RNTheme {
  colors: Record<string, string>;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  button: {
    variants: Record<string, ViewStyle>;
    sizes: Record<string, ViewStyle>;
    text: Record<string, TextStyle>;
  };
}

/**
 * Convert web theme (CSS values) to React Native theme (numeric values)
 */
export function convertThemeToRN(webTheme: WebTheme): RNTheme {
  return {
    colors: webTheme.colors,
    spacing: convertSpacing(webTheme.spacing),
    borderRadius: convertSpacing(webTheme.borderRadius),
    button: {
      variants: {
        primary: {
          backgroundColor: webTheme.colors.primary || '#6366f1',
        },
        secondary: {
          backgroundColor: webTheme.colors.secondary || '#e2e8f0',
        },
        ghost: {
          backgroundColor: 'transparent',
        },
        destructive: {
          backgroundColor: webTheme.colors.destructive || '#ef4444',
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
          color: webTheme.colors.primary || '#6366f1',
        },
        destructive: {
          color: '#ffffff',
        },
      },
    },
  };
}

/**
 * Convert CSS spacing values (e.g., "16px", "1rem") to React Native numeric values
 */
function convertSpacing(spacing: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(spacing)) {
    result[key] = parseCssValue(value);
  }
  
  return result;
}

/**
 * Parse CSS value to number
 * Supports: px, rem (assuming 1rem = 16px)
 */
function parseCssValue(value: string): number {
  if (value.endsWith('px')) {
    return parseFloat(value);
  }
  if (value.endsWith('rem')) {
    return parseFloat(value) * 16;
  }
  // Default fallback
  return parseFloat(value) || 0;
}

/**
 * Default RN theme (fallback when web theme is not available)
 */
export const defaultRNTheme: RNTheme = {
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
    '2xl': 48,
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
