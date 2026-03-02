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
}

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  children,
  style,
  ...rest
}: TypographyProps) {
  const theme = useTheme();

  const variantStyles: Record<TypographyVariant, TextStyle> = {
    h1: {
      fontSize: theme.typography.sizes['4xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes['4xl'],
      color: theme.colors.foreground,
    },
    h2: {
      fontSize: theme.typography.sizes['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes['3xl'],
      color: theme.colors.foreground,
    },
    h3: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes['2xl'],
      color: theme.colors.foreground,
    },
    h4: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.xl,
      color: theme.colors.foreground,
    },
    body: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.base,
      color: theme.colors.foreground,
    },
    caption: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.fontWeight.normal,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.sm,
      color: theme.colors['muted-foreground'],
    },
    label: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.fontWeight.medium,
      lineHeight: theme.typography.lineHeight * theme.typography.sizes.xs,
      color: theme.colors['muted-foreground'],
      textTransform: 'uppercase',
    },
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        { textAlign: align },
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

Typography.displayName = 'Typography';
