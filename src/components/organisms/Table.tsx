/**
 * Table Organism Component
 *
 * A data table component with headers, rows, sorting, and selection.
 * Uses ScrollView for horizontal scrolling on mobile.
 * Emits events via useEventBus — never manages internal state for search, sort,
 * selection, or pagination. All state is owned by the trait state machine.
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Checkbox } from '../atoms/Checkbox';
import { Badge } from '../atoms/Badge';
import { HStack, VStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T = Record<string, unknown>> {
  /**
   * Column key
   */
  key: string;

  /**
   * Column header label
   */
  label: string;

  /**
   * Sortable column
   * @default false
   */
  sortable?: boolean;

  /**
   * Custom cell renderer
   */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;

  /**
   * Column width
   */
  width?: number;

  /**
   * Column flex
   */
  flex?: number;
}

export interface TableProps<T = Record<string, unknown>> {
  /**
   * Table columns
   */
  columns: TableColumn<T>[];

  /**
   * Entity data (array) or entity name
   */
  entity?: T[] | string;

  /**
   * Additional styles
   */
  style?: ViewStyle;

  /**
   * Enable row selection
   * @default false
   */
  selectable?: boolean;

  /**
   * Enable sorting
   * @default false
   */
  sortable?: boolean;

  /**
   * Current sort column (display hint, mapped from sortBy)
   */
  sortColumn?: string;

  /**
   * Current sort direction (display hint)
   */
  sortDirection?: SortDirection;

  /**
   * Current sort field (from EntityDisplayProps)
   */
  sortBy?: string;

  /**
   * Currently selected item IDs
   */
  selectedIds?: readonly (string | number)[];

  /**
   * Loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: Error | null;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Row actions
   */
  rowActions?: (row: T) => Array<{
    label: string;
    event?: string;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }>;
}

export const Table = <T extends Record<string, unknown>>({
  columns,
  entity,
  style,
  selectable = false,
  sortable = false,
  sortColumn,
  sortDirection: sortDirectionProp,
  sortBy,
  selectedIds,
  isLoading = false,
  error,
  emptyMessage = 'No data available',
  rowActions,
}: TableProps<T>) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  // Resolve data from entity prop
  const resolvedData: T[] = Array.isArray(entity) ? entity : [];

  // Resolve display hints
  const resolvedSortColumn = sortColumn ?? sortBy;
  const resolvedSortDirection = sortDirectionProp ?? 'asc';
  const selectedRows: string[] = selectedIds ? selectedIds.map(String) : [];

  const handleSort = (column: string) => {
    if (!sortable) return;

    const newDirection: SortDirection =
      resolvedSortColumn === column && resolvedSortDirection === 'asc'
        ? 'desc'
        : 'asc';

    eventBus.emit('UI:SORT', { field: column, direction: newDirection });
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selectable) return;
    if (checked) {
      const allIds = resolvedData.map((row) => String(row.id ?? ''));
      eventBus.emit('UI:SELECT', { ids: allIds });
    } else {
      eventBus.emit('UI:DESELECT', { ids: selectedRows });
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    if (!selectable) return;
    if (checked) {
      eventBus.emit('UI:SELECT', { ids: [rowKey] });
    } else {
      eventBus.emit('UI:DESELECT', { ids: [rowKey] });
    }
  };

  const handleRowAction = (action: { event?: string }, row: T) => {
    if (action.event) {
      eventBus.emit(`UI:${action.event}`, { row });
    }
  };

  const allSelected =
    selectable &&
    resolvedData.length > 0 &&
    resolvedData.every((row) => selectedRows.includes(String(row.id)));

  if (isLoading) {
    return (
      <Card style={[styles.container, style ?? {}]}>
        <LoadingState message="Loading table..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, style ?? {}]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  if (resolvedData.length === 0) {
    return (
      <Card style={[styles.container, style ?? {}]}>
        <EmptyState message={emptyMessage} />
      </Card>
    );
  }

  return (
    <Card style={[styles.container, style ?? {}]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header */}
          <View
            style={[
              styles.headerRow,
              { backgroundColor: theme.colors.muted },
            ]}
          >
            {selectable && (
              <View style={[styles.cell, styles.checkboxCell]}>
                <Checkbox
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </View>
            )}
            {columns.map((column) => (
              <TouchableOpacity
                key={column.key}
                onPress={() => column.sortable && handleSort(column.key)}
                disabled={!sortable || !column.sortable}
                style={[
                  styles.cell,
                  { width: column.width, flex: column.flex },
                ]}
              >
                <HStack spacing={4} align="center">
                  <Typography
                    variant="label"
                    style={{
                      color: theme.colors.foreground,
                      fontWeight: sortable && column.sortable ? '600' : '500',
                    }}
                  >
                    {column.label}
                  </Typography>
                  {sortable &&
                    column.sortable &&
                    resolvedSortColumn === column.key && (
                      <Typography variant="caption" color={theme.colors.primary}>
                        {resolvedSortDirection === 'asc' ? '▲' : '▼'}
                      </Typography>
                    )}
                </HStack>
              </TouchableOpacity>
            ))}
            {rowActions && <View style={[styles.cell, styles.actionsCell]} />}
          </View>

          {/* Rows */}
          <VStack spacing={0}>
            {resolvedData.map((row, index) => {
              const rowKey = String(row.id ?? index);
              const isSelected = selectedRows.includes(rowKey);
              const actions = rowActions ? rowActions(row) : [];

              return (
                <HStack
                  key={rowKey}
                  style={[
                    styles.dataRow,
                    {
                      backgroundColor:
                        index % 2 === 0
                          ? theme.colors.card
                          : theme.colors.background,
                      borderBottomColor: theme.colors.border,
                    },
                    isSelected ? { backgroundColor: theme.colors['primary-hover'] } : {},
                  ]}
                >
                  {selectable && (
                    <View style={[styles.cell, styles.checkboxCell]}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(checked: boolean) =>
                          handleSelectRow(rowKey, checked)
                        }
                      />
                    </View>
                  )}
                  {columns.map((column) => (
                    <View
                      key={column.key}
                      style={[
                        styles.cell,
                        { width: column.width, flex: column.flex },
                      ]}
                    >
                      {column.render ? (
                        column.render(row[column.key], row, index)
                      ) : (
                        <Typography
                          variant="body"
                          style={{ color: theme.colors.foreground }}
                        >
                          {row[column.key]?.toString() || '-'}
                        </Typography>
                      )}
                    </View>
                  ))}
                  {rowActions && actions.length > 0 && (
                    <View style={[styles.cell, styles.actionsCell]}>
                      <HStack spacing={4}>
                        {actions.map((action, actionIndex) => (
                          <TouchableOpacity
                            key={actionIndex}
                            onPress={() => handleRowAction(action, row)}
                          >
                            <Badge
                              variant={action.variant ?? 'default'}
                              size="sm"
                            >
                              {action.label}
                            </Badge>
                          </TouchableOpacity>
                        ))}
                      </HStack>
                    </View>
                  )}
                </HStack>
              );
            })}
          </VStack>
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  cell: {
    paddingRight: 16,
    minWidth: 80,
    justifyContent: 'center',
  },
  checkboxCell: {
    width: 48,
    minWidth: 48,
    paddingRight: 8,
  },
  actionsCell: {
    minWidth: 120,
  },
});

Table.displayName = 'Table';
