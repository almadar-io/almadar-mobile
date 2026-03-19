/**
 * DataList Molecule
 *
 * Schema-driven list for iterating over entity data.
 * Parity with @almadar/ui DataList: field variants, formats, badges,
 * progress, item actions, grouping, message variant, pagination.
 */
import React, { useState } from 'react';
import { FlatList, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { getNestedValue } from '../../lib/getNestedValue';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { ProgressBar } from '../atoms/ProgressBar';
import { Divider } from '../atoms/Divider';
import { VStack, HStack } from '../atoms/Stack';
import { InfiniteScrollSentinel } from '../atoms/InfiniteScrollSentinel';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

// ── Field Definition ─────────────────────────────────────────────────

export interface DataListField {
  name: string;
  label?: string;
  icon?: string;
  variant?: 'h3' | 'h4' | 'body' | 'caption' | 'badge' | 'small' | 'progress';
  format?: 'date' | 'currency' | 'number' | 'boolean' | 'percent';
}

// ── Item Action Definition ───────────────────────────────────────────

export interface DataListItemAction {
  label: string;
  event: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

export interface DataListProps {
  entity: unknown | readonly unknown[];
  fields: readonly DataListField[];
  columns?: readonly DataListField[];
  itemActions?: readonly DataListItemAction[];
  gap?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'compact' | 'message';
  groupBy?: string;
  senderField?: string;
  currentUser?: string;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  infiniteScroll?: boolean;
  loadMoreEvent?: string;
  hasMore?: boolean;
  children?: (item: Record<string, unknown>, index: number) => React.ReactNode;
  pageSize?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

function fieldLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusVariant(value: string): 'success' | 'warning' | 'error' | 'default' {
  const v = value.toLowerCase();
  if (['active', 'completed', 'done', 'approved', 'published', 'resolved', 'open', 'online'].includes(v)) return 'success';
  if (['pending', 'in_progress', 'in-progress', 'review', 'draft', 'processing', 'warning'].includes(v)) return 'warning';
  if (['inactive', 'deleted', 'rejected', 'failed', 'error', 'blocked', 'closed', 'offline'].includes(v)) return 'error';
  return 'default';
}

function formatDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatValue(value: unknown, format?: DataListField['format']): string {
  if (value === undefined || value === null) return '';
  switch (format) {
    case 'date': return formatDate(value);
    case 'currency': return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value);
    case 'number': return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'percent': return typeof value === 'number' ? `${Math.round(value)}%` : String(value);
    case 'boolean': return value ? 'Yes' : 'No';
    default: return String(value);
  }
}

function groupData(
  items: Record<string, unknown>[],
  field: string,
): { label: string; items: Record<string, unknown>[] }[] {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const item of items) {
    const key = String(getNestedValue(item, field) ?? '');
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return Array.from(groups.entries()).map(([label, groupItems]) => ({ label, items: groupItems }));
}

const gapValues: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
};

// ── Component ────────────────────────────────────────────────────────

export const DataList: React.FC<DataListProps> = ({
  entity,
  fields: fieldsProp,
  columns: columnsProp,
  itemActions,
  gap = 'none',
  variant = 'default',
  groupBy,
  senderField,
  currentUser,
  style,
  isLoading = false,
  error = null,
  infiniteScroll,
  loadMoreEvent,
  hasMore,
  children,
  pageSize = 5,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [visibleCount, setVisibleCount] = useState(pageSize || Infinity);

  const fields = fieldsProp ?? columnsProp ?? [];
  const allData: Record<string, unknown>[] = (Array.isArray(entity) ? entity : entity ? [entity] : []) as Record<string, unknown>[];
  const data = pageSize > 0 ? allData.slice(0, visibleCount) : allData;
  const hasMoreLocal = pageSize > 0 && visibleCount < allData.length;

  const titleField = fields.find((f) => f.variant === 'h3' || f.variant === 'h4') ?? fields[0];
  const badgeFields = fields.filter((f) => f.variant === 'badge' && f !== titleField);
  const progressFields = fields.filter((f) => f.variant === 'progress');
  const bodyFields = fields.filter(
    (f) => f !== titleField && !badgeFields.includes(f) && !progressFields.includes(f)
  );

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;
  if (data.length === 0) return <EmptyState message="No items found" />;

  const handleAction = (action: DataListItemAction, itemData: Record<string, unknown>) => {
    eventBus.emit(`UI:${action.event}`, { id: itemData.id, row: itemData });
  };

  const isCard = variant === 'card';
  const isCompact = variant === 'compact';
  const isMessage = variant === 'message';

  // ── Message variant ──────────────────────────────────────────────
  if (isMessage) {
    const groups = groupBy ? groupData(data, groupBy) : [{ label: '', items: data }];
    const contentField = titleField?.name ?? fields[0]?.name ?? '';

    return (
      <VStack spacing={theme.spacing[2]} style={style}>
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.label !== '' && (
              <VStack spacing={4}>
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], fontWeight: '600' }}>{group.label}</Typography>
                <Divider />
              </VStack>
            )}
            {group.items.map((itemData, index) => {
              const id = String(itemData.id ?? `${gi}-${index}`);
              const sender = senderField ? String(getNestedValue(itemData, senderField) ?? '') : '';
              const isSent = Boolean(currentUser && sender === currentUser);
              const content = getNestedValue(itemData, contentField);
              const timestampField = fields.find((f) => f.format === 'date');
              const timestamp = timestampField ? getNestedValue(itemData, timestampField.name) : null;

              return (
                <View
                  key={id}
                  style={[
                    styles.messageRow,
                    { justifyContent: isSent ? 'flex-end' : 'flex-start' },
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor: isSent ? theme.colors.primary : theme.colors.muted,
                        borderBottomRightRadius: isSent ? 4 : 16,
                        borderBottomLeftRadius: isSent ? 16 : 4,
                      },
                    ]}
                  >
                    {!isSent && senderField && (
                      <Typography variant="caption" style={{ color: isSent ? theme.colors['primary-foreground'] : theme.colors.foreground, fontWeight: '600' }}>
                        {sender}
                      </Typography>
                    )}
                    <Typography variant="body" style={{ color: isSent ? theme.colors['primary-foreground'] : theme.colors.foreground }}>
                      {content !== undefined && content !== null ? String(content) : ''}
                    </Typography>
                    {timestamp != null && (
                      <Typography variant="caption" style={{ color: isSent ? theme.colors['primary-foreground'] : theme.colors['muted-foreground'], opacity: 0.7, marginTop: 2, fontSize: 10 }}>
                        {formatDate(timestamp)}
                      </Typography>
                    )}
                  </View>
                </View>
              );
            })}
          </React.Fragment>
        ))}
      </VStack>
    );
  }

  // ── Render-prop children ─────────────────────────────────────────
  const hasRenderProp = typeof children === 'function';

  // ── Grouped rendering ────────────────────────────────────────────
  const groups = groupBy ? groupData(data, groupBy) : [{ label: '', items: data }];

  const renderItem = (itemData: Record<string, unknown>, index: number) => {
    if (hasRenderProp) {
      return (
        <View
          style={[
            styles.row,
            { padding: isCompact ? theme.spacing[2] : theme.spacing[4] },
          ]}
        >
          {children(itemData, index)}
          {itemActions && itemActions.length > 0 && (
            <HStack spacing={theme.spacing[2]} style={styles.actions}>
              {itemActions.map((action) => (
                <Button
                  key={action.event}
                  variant={action.variant === 'danger' ? 'destructive' : (action.variant ?? 'ghost')}
                  size="sm"
                  onPress={() => handleAction(action, itemData)}
                >
                  {action.label}
                </Button>
              ))}
            </HStack>
          )}
        </View>
      );
    }

    const titleValue = getNestedValue(itemData, titleField?.name ?? '');

    return (
      <View
        style={[
          styles.row,
          { padding: isCompact ? theme.spacing[2] : theme.spacing[4] },
          isCard && {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: theme.spacing[2],
            ...theme.shadows.sm,
          },
        ]}
      >
        {/* Title + badges */}
        <HStack spacing={theme.spacing[2]} align="center">
          {titleValue !== undefined && titleValue !== null && (
            <Typography
              variant={titleField?.variant === 'h3' ? 'h3' : 'h4'}
              style={{ flex: 1, color: theme.colors.foreground, fontWeight: '600' }}
            >
              {String(titleValue)}
            </Typography>
          )}
          {badgeFields.map((field) => {
            const val = getNestedValue(itemData, field.name);
            if (val === undefined || val === null) return null;
            return (
              <Badge key={field.name} variant={statusVariant(String(val))}>
                {String(val)}
              </Badge>
            );
          })}
        </HStack>

        {/* Body fields */}
        {bodyFields.length > 0 && !isCompact && (
          <HStack spacing={theme.spacing[3]} style={{ marginTop: theme.spacing[2], flexWrap: 'wrap' }}>
            {bodyFields.map((field) => {
              const value = getNestedValue(itemData, field.name);
              if (value === undefined || value === null || value === '') return null;
              return (
                <HStack key={field.name} spacing={theme.spacing[1]} align="center">
                  <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                    {field.label ?? fieldLabel(field.name)}:
                  </Typography>
                  <Typography variant="body" style={{ color: theme.colors.foreground, fontSize: theme.typography.sizes.sm }}>
                    {formatValue(value, field.format)}
                  </Typography>
                </HStack>
              );
            })}
          </HStack>
        )}

        {/* Progress fields */}
        {progressFields.map((field) => {
          const value = getNestedValue(itemData, field.name);
          if (typeof value !== 'number') return null;
          return (
            <View key={field.name} style={{ marginTop: theme.spacing[2], maxWidth: 200 }}>
              <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], marginBottom: 4 }}>
                {field.label ?? fieldLabel(field.name)}
              </Typography>
              <ProgressBar progress={value} />
            </View>
          );
        })}

        {/* Actions */}
        {itemActions && itemActions.length > 0 && (
          <HStack spacing={theme.spacing[2]} style={[styles.actions, { marginTop: theme.spacing[2] }]}>
            {itemActions.map((action) => (
              <Button
                key={action.event}
                variant={action.variant === 'danger' ? 'destructive' : (action.variant ?? 'ghost')}
                size="sm"
                onPress={() => handleAction(action, itemData)}
              >
                {action.label}
              </Button>
            ))}
          </HStack>
        )}
      </View>
    );
  };

  // Flatten groups for FlatList
  type FlatItem = { type: 'header'; label: string } | { type: 'item'; data: Record<string, unknown>; index: number };
  const flatItems: FlatItem[] = [];
  let globalIndex = 0;
  for (const group of groups) {
    if (group.label) flatItems.push({ type: 'header', label: group.label });
    for (const item of group.items) {
      flatItems.push({ type: 'item', data: item, index: globalIndex++ });
    }
  }

  return (
    <VStack spacing={0} style={style}>
      <FlatList
        data={flatItems}
        keyExtractor={(entry, i) => {
          if (entry.type === 'header') return `header-${i}`;
          return String(entry.data.id ?? entry.index);
        }}
        renderItem={({ item: entry, index: flatIndex }) => {
          if (entry.type === 'header') {
            return (
              <VStack spacing={4}>
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], fontWeight: '600' }}>{entry.label}</Typography>
                <Divider />
              </VStack>
            );
          }
          return (
            <View>
              {renderItem(entry.data, entry.index)}
              {!isCard && flatIndex < flatItems.length - 1 && <Divider />}
            </View>
          );
        }}
        ItemSeparatorComponent={null}
        style={{ gap: gapValues[gap] }}
      />
      {hasMoreLocal && (
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setVisibleCount((prev) => prev + (pageSize || 5))}
          style={{ alignSelf: 'center', marginTop: theme.spacing[3] }}
        >
          Show More ({allData.length - visibleCount} remaining)
        </Button>
      )}
      {infiniteScroll && loadMoreEvent && (
        <InfiniteScrollSentinel
          loadMoreEvent={loadMoreEvent}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  row: {},
  messageRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

DataList.displayName = 'DataList';
