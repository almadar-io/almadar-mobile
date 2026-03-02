import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[] | undefined;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative event name - emits UI:${action} via eventBus on press */
  action?: string;
  /** Payload to include with the action event */
  actionPayload?: Record<string, unknown>;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
  variant = 'default',
  isLoading,
  error,
  action,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = () => {
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload);
    }
    onPress?.();
  };

  if (isLoading) {
    return (
      <View style={[styles.card, style]}>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

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

  if (onPress || action) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
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
