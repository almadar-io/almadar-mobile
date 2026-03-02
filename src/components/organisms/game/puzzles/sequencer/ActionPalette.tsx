import React from 'react';
import {
  View,
  ScrollView,
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

export type ActionCategory = 'movement' | 'logic' | 'interaction' | 'control' | 'custom';

export interface ActionDefinition {
  id: string;
  name: string;
  category: ActionCategory;
  icon?: string;
  description?: string;
  color?: string;
  params?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    options?: string[];
    default?: unknown;
  }>;
}

export interface ActionPaletteProps {
  actions: ActionDefinition[];
  selectedCategory?: ActionCategory | 'all';
  onActionSelect?: (action: ActionDefinition) => void;
  onCategoryChange?: (category: ActionCategory | 'all') => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const categoryLabels: Record<ActionCategory | 'all', string> = {
  all: 'All',
  movement: 'Move',
  logic: 'Logic',
  interaction: 'Interact',
  control: 'Control',
  custom: 'Custom',
};

const categoryBadgeVariants: Record<ActionCategory | 'all', 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  all: 'default',
  movement: 'primary',
  logic: 'secondary',
  interaction: 'success',
  control: 'warning',
  custom: 'error',
};

const categoryIcons: Record<ActionCategory, string> = {
  movement: '➡️',
  logic: '🔀',
  interaction: '👆',
  control: '⚙️',
  custom: '✨',
};

export const ActionPalette: React.FC<ActionPaletteProps> = ({
  actions,
  selectedCategory = 'all',
  onActionSelect,
  onCategoryChange,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const categories: Array<ActionCategory | 'all'> = ['all', 'movement', 'logic', 'interaction', 'control', 'custom'];

  const filteredActions = selectedCategory === 'all'
    ? actions
    : actions.filter((action) => action.category === selectedCategory);

  const handleCategoryPress = (category: ActionCategory | 'all') => {
    eventBus.emit('UI:ACTION_CATEGORY_CHANGED', { category });
    onCategoryChange?.(category);
  };

  const handleActionPress = (action: ActionDefinition) => {
    eventBus.emit('UI:ACTION_SELECTED', { action });
    onActionSelect?.(action);
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading actions..." />
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
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <View style={styles.header}>
        <Typography variant="h4">Action Palette</Typography>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <HStack spacing={8}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.8}
            >
              <Badge
                variant={selectedCategory === category ? 'primary' : categoryBadgeVariants[category]}
                size="md"
              >
                {categoryLabels[category]}
              </Badge>
            </TouchableOpacity>
          ))}
        </HStack>
      </ScrollView>

      <ScrollView
        style={styles.actionsScroll}
        contentContainerStyle={styles.actionsContainer}
      >
        {filteredActions.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="caption" style={{ opacity: 0.5 }}>
              No actions in this category
            </Typography>
          </View>
        ) : (
          <VStack spacing={8}>
            {filteredActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.actionItem,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <HStack spacing={12} align="center">
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: action.color || theme.colors.primary + '20',
                        },
                      ]}
                    >
                      <Typography variant="body">
                        {action.icon || categoryIcons[action.category]}
                      </Typography>
                    </View>

                    <VStack spacing={2} style={styles.actionContent}>
                      <Typography variant="caption" style={{ fontWeight: '600' }}>
                        {action.name}
                      </Typography>
                      {action.description && (
                        <Typography variant="caption" style={{ opacity: 0.6 }}>
                          {action.description}
                        </Typography>
                      )}
                    </VStack>

                    <Badge
                      variant={categoryBadgeVariants[action.category]}
                      size="sm"
                    >
                      {categoryLabels[action.category]}
                    </Badge>
                  </HStack>
                </View>
              </TouchableOpacity>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    maxHeight: 400,
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  categoryScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  categoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsScroll: {
    maxHeight: 300,
  },
  actionsContainer: {
    padding: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  actionItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
});

ActionPalette.displayName = 'ActionPalette';
