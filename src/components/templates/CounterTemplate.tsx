import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface CounterTemplateProps {
  /** Initial count value */
  initialCount?: number;
  /** Count step size */
  step?: number;
  /** Minimum count value */
  min?: number;
  /** Maximum count value */
  max?: number;
  /** Counter title */
  title?: string;
  /** Show reset button */
  showReset?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Card style */
  cardStyle?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event fired when count changes */
  onCountChange?: (count: number) => void;
  /** Event fired when count is reset */
  onReset?: () => void;
}

export const CounterTemplate: React.FC<CounterTemplateProps> = ({
  initialCount = 0,
  step = 1,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  title = 'Counter',
  showReset = true,
  style,
  cardStyle,
  isLoading,
  error,
  entity,
  onCountChange,
  onReset,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [count, setCount] = useState<number>(initialCount);

  const handleIncrement = useCallback(() => {
    setCount((prev) => {
      const newCount = Math.min(prev + step, max);
      eventBus.emit('UI:COUNTER_INCREMENT', { count: newCount, entity });
      onCountChange?.(newCount);
      return newCount;
    });
  }, [step, max, entity, onCountChange, eventBus]);

  const handleDecrement = useCallback(() => {
    setCount((prev) => {
      const newCount = Math.max(prev - step, min);
      eventBus.emit('UI:COUNTER_DECREMENT', { count: newCount, entity });
      onCountChange?.(newCount);
      return newCount;
    });
  }, [step, min, entity, onCountChange, eventBus]);

  const handleReset = useCallback(() => {
    setCount(initialCount);
    eventBus.emit('UI:COUNTER_RESET', { count: initialCount, entity });
    onReset?.();
    onCountChange?.(initialCount);
  }, [initialCount, entity, onReset, onCountChange, eventBus]);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading counter..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState
          message={error.message}
          onRetry={() => eventBus.emit('UI:COUNTER_RETRY', { entity })}
        />
      </View>
    );
  }

  const isAtMin = count <= min;
  const isAtMax = count >= max;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <Card style={[styles.card, cardStyle || {}]}>
        <VStack spacing={24} align="center">
          {/* Title */}
          <Typography variant="h3">{title}</Typography>

          {/* Count Display */}
          <View style={styles.countDisplay}>
            <Typography
              variant="h1"
              style={[
                styles.countText,
                { color: count > 0 ? theme.colors.success : count < 0 ? theme.colors.error : theme.colors.foreground },
              ]}
            >
              {count}
            </Typography>
          </View>

          {/* Controls */}
          <HStack spacing={16} align="center">
            <Button
              variant="secondary"
              action="COUNTER_DECREMENT"
              actionPayload={{ entity, step }}
              onPress={handleDecrement}
              disabled={isAtMin}
            >
              -{step}
            </Button>

            {showReset && (
              <Button
                variant="ghost"
                action="COUNTER_RESET"
                actionPayload={{ entity }}
                onPress={handleReset}
                disabled={count === initialCount}
              >
                Reset
              </Button>
            )}

            <Button
              variant="primary"
              action="COUNTER_INCREMENT"
              actionPayload={{ entity, step }}
              onPress={handleIncrement}
              disabled={isAtMax}
            >
              +{step}
            </Button>
          </HStack>

          {/* Status */}
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            Min: {min} | Max: {max} | Step: {step}
          </Typography>
        </VStack>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    padding: 32,
    minWidth: 280,
    maxWidth: 400,
    width: '100%',
  },
  countDisplay: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  countText: {
    fontSize: 64,
    fontWeight: '700',
  },
});

CounterTemplate.displayName = 'CounterTemplate';
