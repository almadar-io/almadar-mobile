import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'caption' 
  | 'label';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  /** Loading state indicator - renders as skeleton when true */
  isLoading?: boolean;
  /** Error state - can affect styling */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  children,
  style,
  isLoading,
  error,
  ...rest
}: TypographyProps) {
  const theme = useTheme();

  // When loading, return a skeleton-like placeholder
  if (isLoading) {
    return (
      <Text
        style={[
          styles.skeleton,
          {
            backgroundColor: theme.colors.muted,
            width: '60%',
          },
          style,
        ]}
        {...rest}
      >
        {' '}
      </Text>
    );
  }

  const variantStyles: Record<TypographyVariant, TextStyle> = {
    h1: {
      fontSize: theme.typography.sizes['4xl'],
      fontWeight: theme.typography.fontWeight.bold as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes['4xl'],
      color: theme.colors.foreground,
    },
    h2: {
      fontSize: theme.typography.sizes['3xl'],
      fontWeight: theme.typography.fontWeight.bold as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes['3xl'],
      color: theme.colors.foreground,
    },
    h3: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.fontWeight.bold as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes['2xl'],
      color: theme.colors.foreground,
    },
    h4: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.fontWeight.medium as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.xl,
      color: theme.colors.foreground,
    },
    body: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.fontWeight.normal as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.base,
      color: theme.colors.foreground,
    },
    caption: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.fontWeight.normal as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.sm,
      color: theme.colors['muted-foreground'],
    },
    label: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.fontWeight.medium as TextStyle['fontWeight'],
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.xs,
      color: theme.colors['muted-foreground'],
      textTransform: 'uppercase',
    },
  };

  const textColor = error ? theme.colors.error : (color || variantStyles[variant].color);

  return (
    <Text
      style={[
        variantStyles[variant],
        { textAlign: align, color: textColor },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 4,
  },
});

Typography.displayName = 'Typography';
