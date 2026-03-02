import React from 'react';
import { 
  View, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissAction?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Payload for dismiss action */
  actionPayload?: Record<string, unknown>;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  message,
  variant = 'info',
  dismissible = false,
  onDismiss,
  dismissAction,
  style,
  isLoading,
  error,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleDismiss = () => {
    if (dismissAction) {
      eventBus.emit(`UI:${dismissAction}`, actionPayload);
    }
    onDismiss?.();
  };

  const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string }> = {
    info: {
      bg: theme.colors.info,
      border: theme.colors.info,
      icon: 'ℹ️',
    },
    success: {
      bg: theme.colors.success,
      border: theme.colors.success,
      icon: '✓',
    },
    warning: {
      bg: theme.colors.warning,
      border: theme.colors.warning,
      icon: '⚠️',
    },
    error: {
      bg: theme.colors.error,
      border: theme.colors.error,
      icon: '✕',
    },
  };

  const { bg, border } = variantStyles[variant];

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg + '20', // 20% opacity
          borderColor: border,
        },
        style,
      ]}
    >
      <HStack spacing={12} align="flex-start">
        <View style={[styles.icon, { backgroundColor: bg }]}>
          <Typography variant="body" style={{ color: theme.colors['info-foreground'] }}>
            {variantStyles[variant].icon}
          </Typography>
        </View>
        
        <View style={styles.content}>
          {title && (
            <Typography variant="h4" style={{ color: theme.colors.foreground }}>
              {title}
            </Typography>
          )}
          <Typography variant="body" style={{ color: theme.colors.foreground }}>
            {message}
          </Typography>
        </View>

        {dismissible && (
          <TouchableOpacity onPress={handleDismiss} style={styles.dismiss}>
            <Typography variant="body" style={{ color: theme.colors['muted-foreground'] }}>
              ✕
            </Typography>
          </TouchableOpacity>
        )}
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  dismiss: {
    padding: 4,
  },
});

Alert.displayName = 'Alert';
