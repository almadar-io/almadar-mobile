import type { RNTheme } from '../providers/ThemeContext';

// Re-export RNTheme from providers
export type { RNTheme } from '../providers/ThemeContext';

// Web theme structure (from @almadar/ui)
export interface WebTheme {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

/**
 * Convert web theme (CSS values) to React Native theme (numeric values)
 */
export function convertThemeToRN(webTheme: WebTheme): RNTheme {
  const spacing = convertSpacing(webTheme.spacing);
  const borderRadius = convertSpacing(webTheme.borderRadius);
  
  return {
    colors: webTheme.colors as RNTheme['colors'],
    spacing: {
      xs: spacing.xs || 4,
      sm: spacing.sm || 8,
      md: spacing.md || 16,
      lg: spacing.lg || 24,
      xl: spacing.xl || 32,
      ...spacing,
    },
    borderRadius: {
      sm: borderRadius.sm || 4,
      md: borderRadius.md || 8,
      lg: borderRadius.lg || 12,
      xl: borderRadius.xl || 16,
      ...borderRadius,
    },
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
          color: '#6366f1',
        },
        destructive: {
          color: '#ffffff',
        },
      },
    },
  };
}

function convertSpacing(spacing: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(spacing)) {
    const num = parseFloat(value);
    result[key] = isNaN(num) ? 0 : num;
  }
  return result;
}

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
