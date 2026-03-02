import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

export interface RepeatableItem {
  id: string;
  data: Record<string, unknown>;
}

export interface RepeatableFormSectionProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Minimum number of items */
  minItems?: number;
  /** Maximum number of items */
  maxItems?: number;
  /** Initial items */
  initialItems?: RepeatableItem[];
  /** Render function for each item */
  renderItem: (item: RepeatableItem, index: number, actions: {
    remove: () => void;
    update: (data: Record<string, unknown>) => void;
  }) => React.ReactNode;
  /** Label for the add button */
  addButtonLabel?: string;
  /** Label for the remove button */
  removeButtonLabel?: string;
  /** Icon for remove button (as text/emoji) */
  removeIcon?: string;
  /** Callback when items change */
  onChange?: (items: RepeatableItem[]) => void;
  /** Event name when item is added */
  addEvent?: string;
  /** Event name when item is removed */
  removeEvent?: string;
  /** Event name when item is updated */
  updateEvent?: string;
}

export const RepeatableFormSection: React.FC<RepeatableFormSectionProps> = ({
  style,
  isLoading,
  error,
  entity,
  title,
  description,
  minItems = 0,
  maxItems = 10,
  initialItems = [],
  renderItem,
  addButtonLabel = 'Add Item',
  removeButtonLabel = 'Remove',
  removeIcon = '✕',
  onChange,
  addEvent = 'REPEATABLE_ADD',
  removeEvent = 'REPEATABLE_REMOVE',
  updateEvent = 'REPEATABLE_UPDATE',
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [items, setItems] = useState<RepeatableItem[]>(
    initialItems.length > 0 
      ? initialItems 
      : minItems > 0 
        ? Array.from({ length: minItems }, (_, i) => ({
            id: `item-${Date.now()}-${i}`,
            data: {},
          }))
        : []
  );

  const generateId = useCallback(() => {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleAddItem = useCallback(() => {
    if (items.length >= maxItems) {
      return;
    }

    const newItem: RepeatableItem = {
      id: generateId(),
      data: {},
    };

    const newItems = [...items, newItem];
    setItems(newItems);

    eventBus.emit(`UI:${addEvent}`, {
      entity,
      item: newItem,
      index: newItems.length - 1,
      totalItems: newItems.length,
    });

    onChange?.(newItems);
  }, [items, maxItems, generateId, entity, addEvent, onChange, eventBus]);

  const handleRemoveItem = useCallback((index: number) => {
    if (items.length <= minItems) {
      return;
    }

    const removedItem = items[index];
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);

    eventBus.emit(`UI:${removeEvent}`, {
      entity,
      item: removedItem,
      index,
      totalItems: newItems.length,
    });

    onChange?.(newItems);
  }, [items, minItems, entity, removeEvent, onChange, eventBus]);

  const handleUpdateItem = useCallback((index: number, data: Record<string, unknown>) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, data: { ...item.data, ...data } } : item
    );
    setItems(newItems);

    eventBus.emit(`UI:${updateEvent}`, {
      entity,
      item: newItems[index],
      index,
      data,
    });

    onChange?.(newItems);
  }, [items, entity, updateEvent, onChange, eventBus]);

  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;

  if (isLoading) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <LoadingState message="Loading section..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <Card style={{ ...styles.container, ...(style || {}) }} padding="lg">
      <VStack spacing={24}>
        {/* Header */}
        {(title || description) && (
          <VStack spacing={4}>
            {title && (
              <Typography variant="h4" style={{ color: theme.colors.foreground }}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body" color={theme.colors['muted-foreground']}>
                {description}
              </Typography>
            )}
          </VStack>
        )}

        {/* Items */}
        {items.length === 0 ? (
          <EmptyState message="No items yet. Click add to create one." />
        ) : (
          <VStack spacing={16}>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  ...styles.itemContainer,
                  borderColor: theme.colors.border,
                }}
              >
                <VStack spacing={12}>
                  {/* Item Header with Remove Button */}
                  <HStack justify="space-between" align="center">
                    <Typography variant="label" color={theme.colors['muted-foreground']}>
                      Item {index + 1}
                    </Typography>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleRemoveItem(index)}
                        action={removeEvent}
                        actionPayload={{
                          entity,
                          itemId: item.id,
                          index,
                        }}
                      >
                        {removeIcon} {removeButtonLabel}
                      </Button>
                    )}
                  </HStack>

                  {/* Item Content */}
                  {renderItem(item, index, {
                    remove: () => handleRemoveItem(index),
                    update: (data) => handleUpdateItem(index, data),
                  })}
                </VStack>
              </View>
            ))}
          </VStack>
        )}

        {/* Add Button */}
        {canAdd && (
          <Button
            variant="secondary"
            onPress={handleAddItem}
            action={addEvent}
            actionPayload={{
              entity,
              currentCount: items.length,
            }}
          >
            + {addButtonLabel}
          </Button>
        )}

        {/* Item Count Indicator */}
        <Typography
          variant="caption"
          color={theme.colors['muted-foreground']}
          style={{ textAlign: 'right' }}
        >
          {items.length} / {maxItems} items
        </Typography>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  itemContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
});

RepeatableFormSection.displayName = 'RepeatableFormSection';
