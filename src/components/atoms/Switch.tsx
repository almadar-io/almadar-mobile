import React from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ViewStyle,
  Animated 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
  /** Payload to include with the change event */
  actionPayload?: Record<string, unknown>;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  style,
  isLoading,
  error,
  changeEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const translateX = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

  React.useEffect(() => {
    const { width } = sizeStyles[size];
    const thumbWidth = width * 0.4;
    const travelDistance = width - thumbWidth - 4;
    
    Animated.timing(translateX, {
      toValue: checked ? travelDistance : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [checked, size]);

  const handlePress = () => {
    if (disabled || isLoading) return;
    
    const newValue = !checked;
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { ...actionPayload, checked: newValue });
    }
    onChange?.(newValue);
  };

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

  const sizeStyles: Record<string, { width: number; height: number }> = {
    sm: { width: 36, height: 20 },
    md: { width: 48, height: 28 },
    lg: { width: 60, height: 36 },
  };

  const { width, height } = sizeStyles[size];
  const thumbSize = height - 4;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.track,
        {
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: checked 
            ? theme.colors.primary 
            : theme.colors['muted-foreground'],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: theme.colors['primary-foreground'],
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

Switch.displayName = 'Switch';
