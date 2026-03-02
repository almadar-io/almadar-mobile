import React, { useEffect } from 'react';
import { 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle,
  Animated
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: (id: string) => void;
  dismissAction?: string;
  style?: ViewStyle;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Payload for dismiss action */
  actionPayload?: Record<string, unknown>;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  duration = 5000,
  onDismiss,
  dismissAction,
  style,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (dismissAction) {
        eventBus.emit(`UI:${dismissAction}`, { ...actionPayload, toastId: id });
      }
      onDismiss?.(id);
    });
  };

  const variantStyles: Record<ToastVariant, { bg: string }> = {
    info: { bg: theme.colors.info },
    success: { bg: theme.colors.success },
    warning: { bg: theme.colors.warning },
    error: { bg: theme.colors.error },
  };

  const { bg } = variantStyles[variant];
  const textColor = variant === 'warning' ? '#000000' : '#ffffff';

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bg },
        { transform: [{ translateY }], opacity },
        style,
      ]}
    >
      <HStack spacing={12} align="center" justify="space-between">
        <Typography variant="body" style={{ color: textColor, flex: 1 }}>
          {message}
        </Typography>
        
        <TouchableOpacity onPress={handleDismiss} style={styles.dismiss}>
          <Typography variant="body" style={{ color: textColor }}>
            ✕
          </Typography>
        </TouchableOpacity>
      </HStack>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dismiss: {
    padding: 4,
  },
});

Toast.displayName = 'Toast';
