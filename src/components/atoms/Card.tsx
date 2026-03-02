import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
  variant = 'default',
}) => {
  const theme = useTheme();

  const paddingStyles: Record<string, ViewStyle> = {
    none: { padding: 0 },
    sm: { padding: theme.spacing[3] },
    md: { padding: theme.spacing[4] },
    lg: { padding: theme.spacing[6] },
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: theme.colors.card,
      ...theme.shadows.main,
    },
    elevated: {
      backgroundColor: theme.colors.card,
      ...theme.shadows.lg,
    },
    outlined: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.none,
    },
  };

  const cardStyles: ViewStyle[] = [
    styles.card,
    variantStyles[variant],
    paddingStyles[padding],
  ];

  if (Array.isArray(style)) {
    cardStyles.push(...style);
  } else if (style) {
    cardStyles.push(style);
  }

  const content = <View style={cardStyles}>{children}</View>;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
});

Card.displayName = 'Card';
