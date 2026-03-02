import React from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface RadioProps {
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

export const Radio: React.FC<RadioProps> = ({
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

  const sizeStyles: Record<string, { outer: number; inner: number }> = {
    sm: { outer: 18, inner: 8 },
    md: { outer: 24, inner: 10 },
    lg: { outer: 32, inner: 14 },
  };

  const { outer, inner } = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderWidth: 2,
          borderColor: checked 
            ? theme.colors.primary 
            : theme.colors.border,
          backgroundColor: theme.colors.card,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {checked && (
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: theme.colors.primary,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Radio.displayName = 'Radio';
