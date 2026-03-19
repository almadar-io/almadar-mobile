import React, { useState } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export type StarRatingPrecision = 'full' | 'half';

export interface StarRatingProps {
  value?: number;
  max?: number;
  readOnly?: boolean;
  precision?: StarRatingPrecision;
  size?: number;
  action?: string;
  actionPayload?: Record<string, unknown>;
  onChange?: (value: number) => void;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value: controlledValue,
  max = 5,
  readOnly = false,
  precision = 'full',
  size = 28,
  action,
  actionPayload,
  onChange,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalValue, setInternalValue] = useState(controlledValue ?? 0);
  const currentValue = controlledValue ?? internalValue;

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;

  const handlePress = (starIndex: number) => {
    if (readOnly) return;
    const newValue = starIndex + 1;
    setInternalValue(newValue);
    onChange?.(newValue);
    if (action) {
      eventBus.emit(`UI:${action}`, { ...actionPayload, value: newValue });
    }
  };

  const handleHalfPress = (starIndex: number) => {
    if (readOnly || precision !== 'half') return;
    const newValue = starIndex + 0.5;
    setInternalValue(newValue);
    onChange?.(newValue);
    if (action) {
      eventBus.emit(`UI:${action}`, { ...actionPayload, value: newValue });
    }
  };

  const stars = [];
  for (let i = 0; i < max; i++) {
    const filled = currentValue >= i + 1;
    const halfFilled = !filled && currentValue >= i + 0.5;
    const starChar = filled ? '★' : halfFilled ? '⯪' : '☆';
    const starColor = filled || halfFilled ? theme.colors.warning : theme.colors.border;

    stars.push(
      <Pressable
        key={i}
        onPress={() => handlePress(i)}
        onLongPress={() => handleHalfPress(i)}
        disabled={readOnly}
        style={styles.star}
      >
        <Typography
          variant="body"
          style={{
            color: starColor,
            fontSize: size,
            lineHeight: size * 1.2,
          }}
        >
          {starChar}
        </Typography>
      </Pressable>
    );
  }

  return (
    <HStack spacing={4} align="center" style={style}>
      {stars}
    </HStack>
  );
};

const styles = StyleSheet.create({
  star: {
    padding: 2,
  },
});

StarRating.displayName = 'StarRating';
