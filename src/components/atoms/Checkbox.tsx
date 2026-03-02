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

export interface CheckboxProps {
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

export const Checkbox: React.FC<CheckboxProps> = ({
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

  const sizeStyles: Record<string, { box: number; check: number }> = {
    sm: { box: 18, check: 10 },
    md: { box: 24, check: 14 },
    lg: { box: 32, check: 18 },
  };

  const { box, check } = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          width: box,
          height: box,
          borderRadius: theme.borderRadius.sm,
          borderWidth: 2,
          borderColor: checked 
            ? theme.colors.primary 
            : theme.colors.border,
          backgroundColor: checked 
            ? theme.colors.primary 
            : theme.colors.card,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {checked && (
        <View
          style={{
            width: check,
            height: check,
            backgroundColor: theme.colors['primary-foreground'],
            transform: [{ rotate: '45deg' }],
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

Checkbox.displayName = 'Checkbox';
