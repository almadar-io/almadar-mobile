import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { List } from '../molecules/List';
import { Badge } from '../atoms/Badge';

export interface EntityListProps<T> {
  entity: string;
  columns: Array<keyof T>;
  data: T[];
  keyExtractor: (item: T) => string;
  onItemPress?: (item: T) => void;
  getBadgeVariant?: (column: keyof T, value: unknown) => 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
}

export function EntityList<T>({
  entity,
  columns,
  data,
  keyExtractor,
  onItemPress,
  getBadgeVariant,
  isLoading,
  isError,
  onRetry,
  emptyMessage = `No ${entity.toLowerCase()}s found`,
}: EntityListProps<T>) {
  const renderItem = (item: T) => {
    const primaryColumn = columns[0];
    const secondaryColumns = columns.slice(1);

    return (
      <Card
        onPress={onItemPress ? () => onItemPress(item) : undefined}
        padding="md"
        style={styles.card}
      >
        <VStack spacing={8}>
          <Typography variant="h4">
            {String(item[primaryColumn])}
          </Typography>
          
          {secondaryColumns.length > 0 && (
            <HStack spacing={12} style={styles.details}>
              {secondaryColumns.map((column) => {
                const value = item[column];
                const variant = getBadgeVariant?.(column, value) || 'default';
                
                return (
                  <HStack key={String(column)} spacing={4} align="center">
                    <Typography variant="caption" color="#6b7280">
                      {String(column)}:
                    </Typography>
                    <Badge variant={variant} size="sm">
                      {String(value)}
                    </Badge>
                  </HStack>
                );
              })}
            </HStack>
          )}
        </VStack>
      </Card>
    );
  };

  return (
    <List
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      emptyMessage={emptyMessage}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
  },
  details: {
    flexWrap: 'wrap',
  },
});

EntityList.displayName = 'EntityList';
