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

export type ActionTileSize = 'sm' | 'md' | 'lg';
export type ActionTileVariant = 'default' | 'selected' | 'disabled' | 'error';

export interface ActionTileProps {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  size?: ActionTileSize;
  variant?: ActionTileVariant;
  isDraggable?: boolean;
  params?: Record<string, unknown>;
  onPress?: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const sizeStyles: Record<ActionTileSize, { container: ViewStyle; icon: ViewStyle }> = {
  sm: {
    container: {
      padding: 8,
      minHeight: 60,
    },
    icon: {
      width: 28,
      height: 28,
      borderRadius: 6,
    },
  },
  md: {
    container: {
      padding: 12,
      minHeight: 80,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: 8,
    },
  },
  lg: {
    container: {
      padding: 16,
      minHeight: 100,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 10,
    },
  },
};

const variantStyles = (
  theme: ReturnType<typeof useTheme>
): Record<ActionTileVariant, { backgroundColor: string; borderColor: string; opacity: number }> => ({
  default: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    opacity: 1,
  },
  selected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
    opacity: 1,
  },
  disabled: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  error: {
    backgroundColor: theme.colors.error + '15',
    borderColor: theme.colors.error,
    opacity: 1,
  },
});

export const ActionTile: React.FC<ActionTileProps> = ({
  id,
  name,
  icon,
  description,
  category,
  size = 'md',
  variant = 'default',
  isDraggable = false,
  params,
  onPress,
  onLongPress,
  onDelete,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const variants = variantStyles(theme);
  const currentVariant = variants[variant];
  const sizeConfig = sizeStyles[size];

  const handlePress = () => {
    if (variant !== 'disabled') {
      eventBus.emit('UI:ACTION_TILE_PRESSED', { id, name, params });
      onPress?.();
    }
  };

  const handleLongPress = () => {
    if (variant !== 'disabled') {
      eventBus.emit('UI:ACTION_TILE_LONG_PRESSED', { id, name });
      onLongPress?.();
    }
  };

  const handleDelete = () => {
    eventBus.emit('UI:ACTION_TILE_DELETED', { id });
    onDelete?.();
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, sizeConfig.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, sizeConfig.container, ...(style ? [style] : [])]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={variant === 'disabled' ? 1 : 0.8}
      disabled={variant === 'disabled'}
    >
      <Card
        style={[
          styles.container,
          sizeConfig.container,
          {
            backgroundColor: currentVariant.backgroundColor,
            borderColor: currentVariant.borderColor,
            borderWidth: 2,
            opacity: currentVariant.opacity,
          },
          ...(isDraggable ? [styles.draggable] : []),
          ...(style ? [style] : []),
        ]}
      >
        <HStack spacing={12} align="center" style={styles.content}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                sizeConfig.icon,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Typography variant="body">{icon}</Typography>
            </View>
          )}

          <VStack spacing={2} style={styles.textContent}>
            <Typography
              variant={size === 'sm' ? 'caption' : 'body'}
              style={{ fontWeight: '600' }}
            >
              {name}
            </Typography>

            {description && size !== 'sm' && (
              <Typography variant="caption" style={{ opacity: 0.6 }}>
                {description}
              </Typography>
            )}

            {category && size === 'lg' && (
              <Badge variant="default" size="sm" style={styles.categoryBadge}>
                {category}
              </Badge>
            )}
          </VStack>

          {onDelete && variant !== 'disabled' && (
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

          {isDraggable && (
            <View style={styles.dragHandle}>
              <View style={[styles.dragLine, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.dragLine, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.dragLine, { backgroundColor: theme.colors.border }]} />
            </View>
          )}
        </HStack>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  draggable: {
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  dragHandle: {
    paddingHorizontal: 4,
    gap: 3,
  },
  dragLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
});

ActionTile.displayName = 'ActionTile';
