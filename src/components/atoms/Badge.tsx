import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const theme = useTheme();

  const variantStyles: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
    default: {
      container: {
        backgroundColor: theme.colors.secondary,
      },
      text: {
        color: theme.colors['secondary-foreground'],
      },
    },
    primary: {
      container: {
        backgroundColor: theme.colors.primary,
      },
      text: {
        color: theme.colors['primary-foreground'],
      },
    },
    secondary: {
      container: {
        backgroundColor: theme.colors['secondary-hover'],
      },
      text: {
        color: theme.colors['secondary-foreground'],
      },
    },
    success: {
      container: {
        backgroundColor: theme.colors.success,
      },
      text: {
        color: theme.colors['success-foreground'],
      },
    },
    warning: {
      container: {
        backgroundColor: theme.colors.warning,
      },
      text: {
        color: theme.colors['warning-foreground'],
      },
    },
    error: {
      container: {
        backgroundColor: theme.colors.error,
      },
      text: {
        color: theme.colors['error-foreground'],
      },
    },
  };

  const sizeStyles: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingHorizontal: theme.spacing[2],
        paddingVertical: theme.spacing[0.5],
        borderRadius: theme.borderRadius.full,
      },
      text: {
        fontSize: theme.typography.sizes.xs,
      },
    },
    md: {
      container: {
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[1],
        borderRadius: theme.borderRadius.full,
      },
      text: {
        fontSize: theme.typography.sizes.sm,
      },
    },
  };

  const variant = variantStyles[variant];
  const size = sizeStyles[size];

  return (
    <View style={[styles.badge, variant.container, size.container, style]}>
      <Text style={[styles.text, variant.text, size.text]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
});

Badge.displayName = 'Badge';
