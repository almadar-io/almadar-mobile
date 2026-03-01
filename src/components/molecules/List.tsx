import React from 'react';
import { 
  FlatList, 
  FlatListProps, 
  StyleSheet, 
  View 
} from 'react-native';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface ListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
}

export function List<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading,
  isError,
  emptyMessage = 'No items found',
  onRetry,
  contentContainerStyle,
  ...flatListProps
}: ListProps<T>) {
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
    <FlatList
      data={data}
      renderItem={({ item, index }) => renderItem(item, index)}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

List.displayName = 'List';
