/**
 * Meter Molecule Component
 *
 * A gauge/meter component for displaying a value within a range.
 * Supports linear and segmented display modes.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - style for external styling
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export type MeterVariant = 'linear' | 'segmented';

export interface MeterThreshold {
  value: number;
  color: string;
  label?: string;
}

export interface MeterAction {
  label: string;
  event?: string;
  navigatesTo?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface MeterProps {
  /** Current value */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Display label */
  label?: string;
  /** Unit suffix (e.g., '%', 'MB', 'credits') */
  unit?: string;
  /** Display variant */
  variant?: MeterVariant;
  /** Color thresholds */
  thresholds?: readonly MeterThreshold[];
  /** Number of segments (for segmented variant) */
  segments?: number;
  /** Show value text */
  showValue?: boolean;
  /** Actions */
  actions?: readonly MeterAction[];
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Additional styles */
  style?: ViewStyle;
}

/** Default thresholds using theme colors */
const getDefaultThresholds = (theme: ReturnType<typeof useTheme>): MeterThreshold[] => [
  { value: 30, color: theme.colors.error },
  { value: 70, color: theme.colors.warning },
  { value: 100, color: theme.colors.success },
];

function getColorForValue(
  value: number,
  max: number,
  thresholds: readonly MeterThreshold[],
  theme: ReturnType<typeof useTheme>
): string {
  const percentage = (value / max) * 100;
  for (const threshold of thresholds) {
    if (percentage <= threshold.value) {
      return threshold.color;
    }
  }
  return thresholds[thresholds.length - 1]?.color ?? theme.colors.primary;
}

export const Meter: React.FC<MeterProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  unit,
  variant = 'linear',
  thresholds: thresholdsProp,
  segments = 5,
  showValue = true,
  actions,
  entity,
  isLoading = false,
  error,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const thresholds = useMemo(
    () => thresholdsProp ?? getDefaultThresholds(theme),
    [thresholdsProp, theme]
  );

  const handleAction = useCallback(
    (action: MeterAction) => {
      if (action.event) {
        eventBus.emit(`UI:${action.event}`, { value, entity });
      }
      if (action.navigatesTo) {
        eventBus.emit('UI:NAVIGATE', { to: action.navigatesTo });
      }
    },
    [eventBus, value, entity]
  );

  // Handle action click
  const onActionPress = (action: MeterAction) => () => {
    handleAction(action);
  };

  const percentage = useMemo(() => {
    const range = max - min;
    if (range <= 0) return 0;
    return Math.min(Math.max(((value - min) / range) * 100, 0), 100);
  }, [value, min, max]);

  const activeColor = useMemo(
    () => getColorForValue(value, max, thresholds, theme),
    [value, max, thresholds, theme]
  );

  const displayValue = useMemo(() => {
    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    return unit ? `${formatted}${unit}` : formatted;
  }, [value, unit]);

  if (isLoading) {
    return (
      <Card style={[styles.container, style ?? {}]}>
        <LoadingState message="Loading meter..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, style ?? {}]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  if (variant === 'segmented') {
    const activeSegments = Math.round((percentage / 100) * segments);

    return (
      <Card style={[styles.container, style ?? {}]}>
        <VStack spacing={8}>
          {(label || showValue) && (
            <HStack justify="space-between" align="center">
              {label && (
                <Typography
                  variant="caption"
                  color={theme.colors['muted-foreground']}
                >
                  {label}
                </Typography>
              )}
              {showValue && (
                <Typography variant="body" style={{ fontWeight: '600' }}>
                  {displayValue}
                </Typography>
              )}
            </HStack>
          )}
          <HStack spacing={4} style={styles.segmentsContainer}>
            {Array.from({ length: segments }).map((_, idx) => {
              const isActive = idx < activeSegments;
              const segColor = isActive
                ? getColorForValue(
                    ((idx + 1) / segments) * max,
                    max,
                    thresholds,
                    theme
                  )
                : undefined;
              return (
                <View
                  key={idx}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: isActive
                        ? segColor
                        : theme.colors.muted,
                    },
                  ]}
                />
              );
            })}
          </HStack>
          {/* Threshold labels */}
          {thresholds.some((t) => t.label) && (
            <HStack justify="space-between" style={styles.thresholdLabels}>
              {thresholds.map((t, idx) => (
                <Typography
                  key={idx}
                  variant="caption"
                  color={theme.colors['muted-foreground']}
                >
                  {t.label || ''}
                </Typography>
              ))}
            </HStack>
          )}
          {actions && actions.length > 0 && (
            <HStack spacing={8} style={styles.actionsContainer}>
              {actions.map((action, idx) => (
                <TouchableOpacity key={idx} onPress={onActionPress(action)}>
                  <Badge
                    variant={action.variant ?? 'default'}
                    size="sm"
                  >
                    {action.label}
                  </Badge>
                </TouchableOpacity>
              ))}
            </HStack>
          )}
        </VStack>
      </Card>
    );
  }

  // Default: linear
  return (
    <Card style={[styles.container, style ?? {}]}>
      <VStack spacing={8}>
        {(label || showValue) && (
          <HStack justify="space-between" align="center">
            {label && (
              <Typography
                variant="caption"
                color={theme.colors['muted-foreground']}
              >
                {label}
              </Typography>
            )}
            {showValue && (
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {displayValue}
              </Typography>
            )}
          </HStack>
        )}
        <View
          style={[
            styles.track,
            {
              backgroundColor: theme.colors.muted,
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                backgroundColor: activeColor,
              },
            ]}
          />
        </View>
        {/* Min/Max labels */}
        <HStack justify="space-between" style={styles.rangeLabels}>
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            {min}
            {unit ? ` ${unit}` : ''}
          </Typography>
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            {max}
            {unit ? ` ${unit}` : ''}
          </Typography>
        </HStack>
        {actions && actions.length > 0 && (
          <HStack spacing={8} style={styles.actionsContainer}>
            {actions.map((action, idx) => (
              <TouchableOpacity key={idx} onPress={onActionPress(action)}>
                <Badge
                  variant={action.variant ?? 'default'}
                  size="sm"
                >
                  {action.label}
                </Badge>
              </TouchableOpacity>
            ))}
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  track: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  segmentsContainer: {
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  rangeLabels: {
    width: '100%',
    marginTop: 4,
  },
  thresholdLabels: {
    width: '100%',
  },
  actionsContainer: {
    marginTop: 8,
  },
});

Meter.displayName = 'Meter';
