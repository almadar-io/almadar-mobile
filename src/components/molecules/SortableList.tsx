import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  LayoutAnimation,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Icon } from '../atoms/Icon';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export type DragHandlePosition = 'left' | 'right';

export interface SortableListProps<T = Record<string, unknown>> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  reorderEvent?: string;
  dragHandlePosition?: DragHandlePosition;
  onReorder?: (items: T[]) => void;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const SortableList = <T,>({
  items: initialItems,
  renderItem,
  keyExtractor,
  reorderEvent,
  dragHandlePosition = 'left',
  onReorder,
  style,
  isLoading,
  error,
}: SortableListProps<T>): React.ReactElement | null => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [items, setItems] = useState(initialItems);
  const [dragIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      onReorder?.(next);
      if (reorderEvent) {
        eventBus.emit(`UI:${reorderEvent}`, { items: next, fromIndex, toIndex });
      }
      return next;
    });
  }, [onReorder, reorderEvent, eventBus]);

  const handleMoveUp = (index: number) => {
    if (index > 0) moveItem(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < items.length - 1) moveItem(index, index + 1);
  };

  const dragHandle = (index: number) => (
    <View style={styles.handleContainer}>
      <Pressable onPress={() => handleMoveUp(index)} disabled={index === 0}>
        <Icon name="chevron-up" size={18} color={index === 0 ? theme.colors.border : theme.colors['muted-foreground']} />
      </Pressable>
      <Icon name="menu" size={18} color={dragIndex === index ? theme.colors.primary : theme.colors['muted-foreground']} />
      <Pressable onPress={() => handleMoveDown(index)} disabled={index === items.length - 1}>
        <Icon name="chevron-down" size={18} color={index === items.length - 1 ? theme.colors.border : theme.colors['muted-foreground']} />
      </Pressable>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      style={style}
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.row,
            {
              backgroundColor: dragIndex === index ? theme.colors.muted : theme.colors.card,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          {dragHandlePosition === 'left' && dragHandle(index)}
          <View style={styles.content}>{renderItem(item, index)}</View>
          {dragHandlePosition === 'right' && dragHandle(index)}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  handleContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});

(SortableList as React.FC).displayName = 'SortableList';
