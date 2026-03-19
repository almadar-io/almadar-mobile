import React, { useState } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface NumberStepperProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  action?: string;
  actionPayload?: Record<string, unknown>;
  onChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value: controlledValue,
  min = 0,
  max = 99,
  step = 1,
  action,
  actionPayload,
  onChange,
  disabled = false,
  label,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalValue, setInternalValue] = useState(controlledValue ?? min);
  const currentValue = controlledValue ?? internalValue;

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;

  const handleChange = (newValue: number) => {
    const clamped = Math.max(min, Math.min(max, newValue));
    setInternalValue(clamped);
    onChange?.(clamped);
    if (action) {
      eventBus.emit(`UI:${action}`, { ...actionPayload, value: clamped });
    }
  };

  const canDecrement = currentValue > min;
  const canIncrement = currentValue < max;

  return (
    <HStack spacing={theme.spacing[3]} align="center" style={style}>
      {label && (
        <Typography variant="label" style={{ color: theme.colors.foreground, flex: 1 }}>
          {label}
        </Typography>
      )}
      <HStack spacing={0} align="center">
        <Pressable
          onPress={() => handleChange(currentValue - step)}
          disabled={disabled || !canDecrement}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.secondary,
              borderTopLeftRadius: theme.borderRadius.md,
              borderBottomLeftRadius: theme.borderRadius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
            (disabled || !canDecrement) && styles.buttonDisabled,
          ]}
        >
          <Typography variant="body" style={{ color: theme.colors.foreground, fontWeight: '600' }}>
            −
          </Typography>
        </Pressable>
        <Pressable
          style={[
            styles.valueContainer,
            {
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          <Typography variant="body" style={{ color: theme.colors.foreground, fontWeight: '500' }}>
            {currentValue}
          </Typography>
        </Pressable>
        <Pressable
          onPress={() => handleChange(currentValue + step)}
          disabled={disabled || !canIncrement}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.secondary,
              borderTopRightRadius: theme.borderRadius.md,
              borderBottomRightRadius: theme.borderRadius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
            (disabled || !canIncrement) && styles.buttonDisabled,
          ]}
        >
          <Typography variant="body" style={{ color: theme.colors.foreground, fontWeight: '600' }}>
            +
          </Typography>
        </Pressable>
      </HStack>
    </HStack>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  valueContainer: {
    minWidth: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

NumberStepper.displayName = 'NumberStepper';
