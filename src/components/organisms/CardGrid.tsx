import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoadingState } from '../molecules/LoadingState';
import { EmptyState } from '../molecules/EmptyState';
import { ErrorState } from '../molecules/ErrorState';

export interface CardGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  columns?: number;
}

export function CardGrid<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading,
  isError,
  onRetry,
  emptyMessage = 'No items found',
  columns = 1,
}: CardGridProps<T>) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <View style={styles.container}>
      {data.map((_item, _index) => (
        <View 
          key={keyExtractor(_item)} 
          style={[
            styles.item,
            columns > 1 && { width: `${100 / columns}%` }
          ]}
        >
          {renderItem(_item)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  item: {
    width: '100%',
    padding: 8,
  },
});

CardGrid.displayName = 'CardGrid';
