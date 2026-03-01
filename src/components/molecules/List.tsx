import React from 'react';
import { 
  FlatList, 
  FlatListProps
} from 'react-native';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface ListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
}

export function List<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading,
  isError,
  onRetry,
  emptyMessage = 'No items found',
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
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={keyExtractor}
      {...flatListProps}
    />
  );
}

List.displayName = 'List';
