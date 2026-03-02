import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Badge } from '../../../../atoms/Badge';
import { Typography } from '../../../../atoms/Typography';
import { HStack, VStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

export type StateNodeType = 'initial' | 'normal' | 'final' | 'error';

export interface StateNodeData {
  id: string;
  name: string;
  type: StateNodeType;
  x: number;
  y: number;
  actions?: string[];
  isActive?: boolean;
}

export interface StateNodeProps {
  node: StateNodeData;
  isSelected?: boolean;
  isDragging?: boolean;
  onPress?: (node: StateNodeData) => void;
  onLongPress?: (node: StateNodeData) => void;
  onDelete?: (nodeId: string) => void;
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
): Record<StateNodeType, { background: string; border: string; badge: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> => ({
  initial: {
    background: theme.colors.success + '20',
    border: theme.colors.success,
    badge: 'success',
  },
  normal: {
    background: theme.colors.surface,
    border: theme.colors.border,
    badge: 'default',
  },
  final: {
    background: theme.colors.primary + '20',
    border: theme.colors.primary,
    badge: 'primary',
  },
  error: {
    background: theme.colors.error + '20',
    border: theme.colors.error,
    badge: 'error',
  },
});

const typeLabels: Record<StateNodeType, string> = {
  initial: 'Start',
  normal: 'State',
  final: 'End',
  error: 'Error',
};

const typeIcons: Record<StateNodeType, string> = {
  initial: '▶️',
  normal: '⭕',
  final: '🏁',
  error: '⚠️',
};

export const StateNode: React.FC<StateNodeProps> = ({
  node,
  isSelected = false,
  isDragging = false,
  onPress,
  onLongPress,
  onDelete,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const colors = typeColors(theme);
  const typeStyle = colors[node.type];

  const handlePress = () => {
    eventBus.emit('UI:STATE_NODE_PRESSED', { node });
    onPress?.(node);
  };

  const handleLongPress = () => {
    eventBus.emit('UI:STATE_NODE_LONG_PRESSED', { node });
    onLongPress?.(node);
  };

  const handleDelete = () => {
    eventBus.emit('UI:STATE_NODE_DELETED', { nodeId: node.id });
    onDelete?.(node.id);
  };

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
      onLongPress={handleLongPress}
      activeOpacity={0.9}
    >
      <Card
        style={[
          styles.container,
          {
            backgroundColor: typeStyle.background,
            borderColor: isSelected ? theme.colors.primary : typeStyle.border,
            borderWidth: isSelected ? 3 : 2,
            opacity: isDragging ? 0.7 : node.isActive ? 1 : 0.7,
            transform: isDragging ? [{ scale: 1.05 }] : undefined,
          },
          ...(style ? [style] : []),
        ]}
      >
        <VStack spacing={8}>
          <HStack justify="space-between" align="center">
            <HStack spacing={8} align="center">
              <Typography variant="body">{typeIcons[node.type]}</Typography>
              <Badge variant={typeStyle.badge} size="sm">
                {typeLabels[node.type]}
              </Badge>
            </HStack>

            {onDelete && node.type !== 'initial' && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Typography variant="caption" style={{ color: theme.colors.error, fontSize: 18 }}>
                  ×
                </Typography>
              </TouchableOpacity>
            )}
          </HStack>

          <Typography variant="body" style={{ fontWeight: '700', textAlign: 'center' }}>
            {node.name}
          </Typography>

          {node.actions && node.actions.length > 0 && (
            <View style={[styles.actionsContainer, { backgroundColor: theme.colors.card }]}>
              <Typography variant="caption" style={{ opacity: 0.6, marginBottom: 4 }}>
                Actions:
              </Typography>
              <HStack spacing={4} style={styles.actionsList}>
                {node.actions.slice(0, 3).map((action, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {action}
                  </Badge>
                ))}
                {node.actions.length > 3 && (
                  <Badge variant="default" size="sm">
                    +{node.actions.length - 3}
                  </Badge>
                )}
              </HStack>
            </View>
          )}

          {node.isActive && (
            <View style={styles.activeIndicator}>
              <View style={[styles.pulseDot, { backgroundColor: theme.colors.success }]} />
              <Typography variant="caption" style={{ color: theme.colors.success }}>
                Active
              </Typography>
            </View>
          )}
        </VStack>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 140,
    maxWidth: 200,
    padding: 12,
    borderRadius: 12,
  },
  deleteButton: {
    padding: 4,
  },
  actionsContainer: {
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  actionsList: {
    flexWrap: 'wrap',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

StateNode.displayName = 'StateNode';
