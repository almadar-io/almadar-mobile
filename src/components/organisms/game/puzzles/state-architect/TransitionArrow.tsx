import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Badge } from '../../../../atoms/Badge';
import { Typography } from '../../../../atoms/Typography';
import { HStack, VStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

export type TransitionType = 'default' | 'conditional' | 'timeout' | 'event';

export interface TransitionArrowData {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  type: TransitionType;
  condition?: string;
  timeout?: number;
  eventName?: string;
}

export interface TransitionArrowProps {
  transition: TransitionArrowData;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  isSelected?: boolean;
  isCurved?: boolean;
  onPress?: (transition: TransitionArrowData) => void;
  onDelete?: (transitionId: string) => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const typeColors = (
  theme: ReturnType<typeof useTheme>
): Record<TransitionType, { color: string; badge: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> => ({
  default: {
    color: theme.colors.border,
    badge: 'default',
  },
  conditional: {
    color: theme.colors.warning,
    badge: 'warning',
  },
  timeout: {
    color: theme.colors.primary,
    badge: 'primary',
  },
  event: {
    color: theme.colors.success,
    badge: 'success',
  },
});

const typeIcons: Record<TransitionType, string> = {
  default: '→',
  conditional: '?',
  timeout: '⏱',
  event: '⚡',
};

const typeLabels: Record<TransitionType, string> = {
  default: 'Auto',
  conditional: 'If',
  timeout: 'Wait',
  event: 'On',
};

export const TransitionArrow: React.FC<TransitionArrowProps> = ({
  transition,
  fromX = 0,
  fromY = 0,
  toX = 100,
  toY = 0,
  isSelected = false,
  onPress,
  onDelete,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const colors = typeColors(theme);
  const typeStyle = colors[transition.type];

  const handlePress = () => {
    eventBus.emit('UI:TRANSITION_PRESSED', { transition });
    onPress?.(transition);
  };

  const handleDelete = () => {
    eventBus.emit('UI:TRANSITION_DELETED', { transitionId: transition.id });
    onDelete?.(transition.id);
  };

  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
  const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          left: Math.min(fromX, toX) as DimensionValue,
          top: Math.min(fromY, toY) as DimensionValue,
          width: Math.abs(toX - fromX) || 2,
          height: Math.abs(toY - fromY) || 40,
        },
        style,
      ]}
    >
      <View style={styles.arrowContainer}>
        <View
          style={[
            styles.arrowLine,
            {
              backgroundColor: typeStyle.color,
              width: length,
              height: isSelected ? 3 : 2,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />

        <View
          style={[
            styles.arrowHead,
            {
              borderLeftColor: typeStyle.color,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />

        <Card
          style={[
            styles.labelCard,
            {
              borderColor: isSelected ? theme.colors.primary : typeStyle.color,
              borderWidth: isSelected ? 2 : 1,
              left: midX - Math.min(fromX, toX) - 50,
              top: midY - Math.min(fromY, toY) - 20,
            },
          ]}
        >
          <TouchableOpacity onPress={handlePress}>
            <VStack spacing={4} align="center">
              <HStack spacing={4} align="center">
                <Typography variant="caption">{typeIcons[transition.type]}</Typography>
                <Badge variant={typeStyle.badge} size="sm">
                  {typeLabels[transition.type]}
                </Badge>
              </HStack>

              {transition.label && (
                <Typography variant="caption" style={{ fontWeight: '600' }}>
                  {transition.label}
                </Typography>
              )}

              {transition.condition && (
                <Typography variant="caption" style={{ opacity: 0.7, fontSize: 10 }}>
                  {transition.condition}
                </Typography>
              )}

              {transition.timeout && (
                <Typography variant="caption" style={{ opacity: 0.7, fontSize: 10 }}>
                  {transition.timeout}ms
                </Typography>
              )}

              {transition.eventName && (
                <Typography variant="caption" style={{ opacity: 0.7, fontSize: 10 }}>
                  {transition.eventName}
                </Typography>
              )}
            </VStack>
          </TouchableOpacity>

          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Typography variant="caption" style={{ color: theme.colors.error, fontSize: 14 }}>
                ×
              </Typography>
            </TouchableOpacity>
          )}
        </Card>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  arrowContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  arrowLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
  },
  arrowHead: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderLeftWidth: 10,
  },
  labelCard: {
    position: 'absolute',
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
    backgroundColor: 'white',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
});

TransitionArrow.displayName = 'TransitionArrow';
