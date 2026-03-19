/**
 * DataGrid Molecule
 *
 * Schema-driven card grid for iterating over entity data.
 * Parity with @almadar/ui DataGrid: field variants, formats, badges,
 * image field, item actions, selection, pagination, infinite scroll.
 */
import React, { useState, useCallback } from 'react';
import { FlatList, View, Image, Pressable, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { getNestedValue } from '../../lib/getNestedValue';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { ProgressBar } from '../atoms/ProgressBar';
import { VStack, HStack } from '../atoms/Stack';
import { InfiniteScrollSentinel } from '../atoms/InfiniteScrollSentinel';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

// ── Field Definition ─────────────────────────────────────────────────

export interface DataGridField {
  name: string;
  label?: string;
  icon?: string;
  variant?: 'h3' | 'h4' | 'body' | 'caption' | 'badge' | 'small' | 'progress';
  format?: 'date' | 'currency' | 'number' | 'boolean' | 'percent';
}

// ── Item Action Definition ───────────────────────────────────────────

export interface DataGridItemAction {
  label: string;
  event: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

export interface DataGridProps {
  entity: unknown | readonly unknown[];
  fields: readonly DataGridField[];
  columns?: readonly DataGridField[];
  itemActions?: readonly DataGridItemAction[];
  cols?: 1 | 2 | 3 | 4;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  imageField?: string;
  selectable?: boolean;
  selectionEvent?: string;
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

function formatValue(value: unknown, format?: DataGridField['format']): string {
  if (value === undefined || value === null) return '';
  switch (format) {
    case 'date': {
      if (!value) return '';
      const d = new Date(String(value));
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    case 'currency': return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value);
    case 'number': return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'percent': return typeof value === 'number' ? `${Math.round(value)}%` : String(value);
    case 'boolean': return value ? 'Yes' : 'No';
    default: return String(value);
  }
}

const gapValues: Record<string, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
};

// ── Component ────────────────────────────────────────────────────────

export const DataGrid: React.FC<DataGridProps> = ({
  entity,
  fields: fieldsProp,
  columns: columnsProp,
  itemActions,
  cols = 2,
  gap = 'md',
  style,
  isLoading = false,
  error = null,
  imageField,
  selectable = false,
  selectionEvent,
  infiniteScroll,
  loadMoreEvent,
  hasMore,
  children,
  pageSize = 0,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(pageSize || Infinity);

  const fields = fieldsProp ?? columnsProp ?? [];
  const allData: Record<string, unknown>[] = (Array.isArray(entity) ? entity : entity ? [entity] : []) as Record<string, unknown>[];
  const data = pageSize > 0 ? allData.slice(0, visibleCount) : allData;
  const hasMoreLocal = pageSize > 0 && visibleCount < allData.length;

  const titleField = fields.find((f) => f.variant === 'h3' || f.variant === 'h4') ?? fields[0];
  const badgeFields = fields.filter((f) => f.variant === 'badge' && f !== titleField);
  const bodyFields = fields.filter((f) => f !== titleField && !badgeFields.includes(f));

  const primaryActions = itemActions?.filter((a) => a.variant !== 'danger') ?? [];
  const dangerActions = itemActions?.filter((a) => a.variant === 'danger') ?? [];

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (selectionEvent) {
        eventBus.emit(`UI:${selectionEvent}`, { selectedIds: Array.from(next) });
      }
      return next;
    });
  }, [selectionEvent, eventBus]);

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;
  if (data.length === 0) return <EmptyState message="No items found" />;

  const hasRenderProp = typeof children === 'function';
  const screenWidth = Dimensions.get('window').width;
  const gapSize = gapValues[gap];
  const cardWidth = (screenWidth - gapSize * (cols + 1)) / cols;

  const handleAction = (action: DataGridItemAction, itemData: Record<string, unknown>) => {
    eventBus.emit(`UI:${action.event}`, { id: itemData.id, row: itemData });
  };

  const renderCard = ({ item: itemData, index }: { item: Record<string, unknown>; index: number }) => {
    const id = String(itemData.id ?? index);
    const isSelected = selectedIds.has(id);

    const selectedStyle: ViewStyle = isSelected
      ? { borderColor: theme.colors.primary, borderWidth: 2 }
      : {};
    const baseCardStyle: ViewStyle[] = [
      styles.card,
      { width: cardWidth, margin: gapSize / 2 },
      selectedStyle,
    ];

    if (hasRenderProp) {
      return (
        <Card style={baseCardStyle}>
          {children(itemData, index)}
        </Card>
      );
    }

    const titleValue = getNestedValue(itemData, titleField?.name ?? '');

    return (
      <Card style={baseCardStyle}>
        {/* Card Image */}
        {imageField && (() => {
          const imgUrl = getNestedValue(itemData, imageField);
          if (!imgUrl || typeof imgUrl !== 'string') return null;
          return (
            <Image
              source={{ uri: imgUrl }}
              style={[styles.cardImage, { width: cardWidth - 2 }]}
              resizeMode="cover"
            />
          );
        })()}

        {/* Header: selection + title + badges + danger actions */}
        <View style={[styles.cardHeader, { padding: theme.spacing[3] }]}>
          <HStack spacing={theme.spacing[2]} align="flex-start">
            {selectable && (
              <Pressable onPress={() => toggleSelection(id)} style={styles.checkbox}>
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isSelected && (
                    <Typography variant="caption" style={{ color: theme.colors['primary-foreground'], fontSize: 10 }}>
                      ✓
                    </Typography>
                  )}
                </View>
              </Pressable>
            )}
            <VStack spacing={theme.spacing[1]} style={{ flex: 1 }}>
              {titleValue !== undefined && titleValue !== null && (
                <Typography
                  variant={titleField?.variant === 'h3' ? 'h3' : 'h4'}
                  style={{ color: theme.colors.foreground, fontWeight: '600' }}
                >
                  {String(titleValue)}
                </Typography>
              )}
              {badgeFields.length > 0 && (
                <HStack spacing={theme.spacing[1]} style={{ flexWrap: 'wrap' }}>
                  {badgeFields.map((field) => {
                    const val = getNestedValue(itemData, field.name);
                    if (val === undefined || val === null) return null;
                    return (
                      <Badge key={field.name} variant={statusVariant(String(val))} size="sm">
                        {String(val)}
                      </Badge>
                    );
                  })}
                </HStack>
              )}
            </VStack>
            {dangerActions.length > 0 && (
              <HStack spacing={4}>
                {dangerActions.map((action) => (
                  <Button
                    key={action.event}
                    variant="ghost"
                    size="sm"
                    onPress={() => handleAction(action, itemData)}
                    textStyle={{ color: theme.colors.error }}
                  >
                    {action.label}
                  </Button>
                ))}
              </HStack>
            )}
          </HStack>
        </View>

        {/* Body fields */}
        {bodyFields.length > 0 && (
          <View style={[styles.cardBody, { paddingHorizontal: theme.spacing[3], paddingBottom: theme.spacing[2] }]}>
            <VStack spacing={theme.spacing[1]}>
              {bodyFields.map((field) => {
                const value = getNestedValue(itemData, field.name);
                if (value === undefined || value === null || value === '') return null;

                if (field.format === 'boolean') {
                  return (
                    <HStack key={field.name} spacing={theme.spacing[2]} align="center" style={{ justifyContent: 'space-between' }}>
                      <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                        {field.label ?? fieldLabel(field.name)}
                      </Typography>
                      <Badge variant={value ? 'success' : 'default'} size="sm">
                        {value ? 'Yes' : 'No'}
                      </Badge>
                    </HStack>
                  );
                }

                if (field.variant === 'progress' && typeof value === 'number') {
                  return (
                    <View key={field.name}>
                      <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], marginBottom: 4 }}>
                        {field.label ?? fieldLabel(field.name)}
                      </Typography>
                      <ProgressBar progress={value} />
                    </View>
                  );
                }

                return (
                  <HStack key={field.name} spacing={theme.spacing[2]} align="center" style={{ justifyContent: 'space-between' }}>
                    <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                      {field.label ?? fieldLabel(field.name)}
                    </Typography>
                    <Typography variant="body" style={{ color: theme.colors.foreground, fontSize: theme.typography.sizes.sm }}>
                      {formatValue(value, field.format)}
                    </Typography>
                  </HStack>
                );
              })}
            </VStack>
          </View>
        )}

        {/* Footer: primary actions */}
        {primaryActions.length > 0 && (
          <View
            style={[
              styles.cardFooter,
              {
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                padding: theme.spacing[3],
              },
            ]}
          >
            <HStack spacing={theme.spacing[2]} style={{ justifyContent: 'flex-end' }}>
              {primaryActions.map((action) => (
                <Button
                  key={action.event}
                  variant={action.variant === 'primary' ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => handleAction(action, itemData)}
                >
                  {action.label}
                </Button>
              ))}
            </HStack>
          </View>
        )}
      </Card>
    );
  };

  return (
    <VStack spacing={0} style={style}>
      {/* Selection toolbar */}
      {selectable && selectedIds.size > 0 && (
        <HStack
          spacing={theme.spacing[2]}
          align="center"
          style={{
            paddingVertical: theme.spacing[2],
            paddingHorizontal: theme.spacing[3],
            backgroundColor: theme.colors.muted,
            borderRadius: theme.borderRadius.sm,
            marginBottom: theme.spacing[2],
          }}
        >
          <Typography variant="caption" style={{ color: theme.colors.foreground, fontWeight: '600' }}>
            {selectedIds.size} selected
          </Typography>
        </HStack>
      )}

      <FlatList
        data={data}
        numColumns={cols}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={renderCard}
        contentContainerStyle={{ paddingHorizontal: gapSize / 2 }}
        columnWrapperStyle={cols > 1 ? { justifyContent: 'flex-start' } : undefined}
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
  card: {
    overflow: 'hidden',
    padding: 0,
  },
  cardImage: {
    height: 140,
  },
  cardHeader: {},
  cardBody: {},
  cardFooter: {},
  checkbox: {
    marginTop: 2,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

DataGrid.displayName = 'DataGrid';
