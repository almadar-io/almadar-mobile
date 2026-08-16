/**
 * FilterGroup Molecule Component
 *
 * A component for filtering entity data. Composes atoms (Button, Select, Badge, HStack)
 * and follows the design system using theme colors.
 *
 * Implements the Closed Circuit principle:
 * - FilterGroup updates QuerySingleton filters via query prop
 * - FilterGroup emits UI:FILTER events for trait state machines
 * - entity-list/entity-cards read filtered data via query prop
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Button } from '../atoms/Button';
import { Select, SelectOption } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { HStack, VStack } from '../atoms/Stack';

/** Filter definition from schema */
export interface FilterDefinition {
  field: string;
  label: string;
  /** Filter type */
  filterType?:
    | 'text'
    | 'select'
    | 'toggle'
    | 'checkbox'
    | 'date'
    | 'daterange'
    | 'date-range'
    | 'numberrange'
    | 'number-range';
  /** Alias for filterType (schema compatibility) */
  type?:
    | 'text'
    | 'select'
    | 'toggle'
    | 'checkbox'
    | 'date'
    | 'daterange'
    | 'date-range'
    | 'numberrange'
    | 'number-range';
  /** Options for select/toggle filters */
  options?: readonly string[];
  /** Bounds for numberrange/number-range filters */
  min?: number;
  max?: number;
  step?: number;
}

/** Resolve filter type, supporting both filterType and type aliases */
const resolveFilterType = (filter: FilterDefinition) =>
  filter.filterType ?? filter.type;

/** Clamp a parsed numberrange endpoint to the filter's declared bounds */
const clampRangeValue = (value: number, filter: FilterDefinition): number =>
  Math.max(filter.min ?? -Infinity, Math.min(filter.max ?? Infinity, value));

/** Two-ended numeric value for numberrange/number-range filters */
export interface NumberRangeValue {
  min: number;
  max: number;
}

export interface FilterGroupProps {
  /** Entity name to filter */
  entity: string;
  /** Filter definitions from schema */
  filters: readonly FilterDefinition[];
  /** Callback when a filter changes - for EntityStore integration */
  onFilterChange?: (
    field: string,
    value: string | null | NumberRangeValue
  ) => void;
  /** Callback to clear all filters */
  onClearAll?: () => void;
  /** Additional styles */
  style?: ViewStyle;
  /** Variant style */
  variant?: 'default' | 'compact' | 'pills' | 'vertical';
  /** Show filter icon */
  showIcon?: boolean;
  /**
   * Query singleton binding for state management.
   * When provided, syncs filter state with the query singleton.
   * Example: "@TaskQuery"
   */
  query?: string;
  /** Loading state indicator */
  isLoading?: boolean;
}

/**
 * FilterGroup - Renders filter controls for entity data
 * Uses atoms: Button, Select, Badge, HStack
 */
export const FilterGroup: React.FC<FilterGroupProps> = ({
  entity,
  filters,
  onFilterChange,
  onClearAll,
  style,
  variant = 'default',
  showIcon = true,
  query,
  isLoading: _isLoading,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  // Track selected values for each filter (local state for UI)
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {}
  );

  // Track in-progress numberrange endpoints separately - a range isn't a
  // valid facet value (and shouldn't fire) until both ends are entered
  const [rangeValues, setRangeValues] = useState<
    Record<string, { min?: number; max?: number }>
  >({});

  const handleFilterSelect = useCallback(
    (field: string, value: string | null) => {
      setSelectedValues((prev) => {
        if (value === null || value === '' || value === 'all') {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: value };
      });

      // Call callback if provided (for backward compat)
      onFilterChange?.(field, value === 'all' ? null : value);

      // Emit UI:FILTER event for closed circuit
      eventBus.emit('UI:FILTER', {
        entity,
        field,
        value: value === 'all' ? null : value,
        query,
      });
    },
    [onFilterChange, eventBus, entity, query]
  );

  const handleRangeFilterSelect = useCallback(
    (field: string, next: { min?: number; max?: number }) => {
      setRangeValues((prev) => ({ ...prev, [field]: next }));

      if (next.min === undefined && next.max === undefined) {
        onFilterChange?.(field, null);
        eventBus.emit('UI:FILTER', { entity, field: `${field}_min`, value: null, query });
        eventBus.emit('UI:FILTER', { entity, field: `${field}_max`, value: null, query });
        return;
      }

      // Wait for both ends before firing - a partial range isn't a valid facet value
      if (next.min === undefined || next.max === undefined) {
        return;
      }

      const value: NumberRangeValue = { min: next.min, max: next.max };
      onFilterChange?.(field, value);
      // Bus contract mirrors desktop + std-filter: one FILTER per side as
      // `<field>_min` / `<field>_max` string values, never a combined object.
      eventBus.emit('UI:FILTER', { entity, field: `${field}_min`, value: String(next.min), query });
      eventBus.emit('UI:FILTER', { entity, field: `${field}_max`, value: String(next.max), query });
    },
    [onFilterChange, eventBus, entity, query]
  );

  const handleClearAll = useCallback(() => {
    setSelectedValues({});
    setRangeValues({});

    // Call callback if provided (for backward compat)
    onClearAll?.();

    // Emit UI:CLEAR_FILTERS event for closed circuit
    eventBus.emit('UI:CLEAR_FILTERS', { entity, query });
  }, [onClearAll, eventBus, entity, query]);

  const activeRangeFilterCount = Object.values(rangeValues).filter(
    (v) => v.min !== undefined && v.max !== undefined
  ).length;
  const activeFilterCount =
    Object.keys(selectedValues).length + activeRangeFilterCount;

  const buildSelectOptions = (filter: FilterDefinition): SelectOption[] => {
    return [
      { value: 'all', label: 'All' },
      ...(filter.options?.map((opt) => ({
        value: opt,
        label: opt,
      })) || []),
    ];
  };

  /**
   * Renders the control for one filter. Branches on the desktop filterType
   * contract; types without a 1:1 mobile primitive (date, daterange,
   * date-range) are accepted by the type but render nothing until a mobile
   * date-picker atom exists.
   */
  const renderFilterControl = (
    filter: FilterDefinition,
    selectOptions: SelectOption[] = buildSelectOptions(filter)
  ) => {
    const resolvedType = resolveFilterType(filter);

    if (resolvedType === 'numberrange' || resolvedType === 'number-range') {
      const range = rangeValues[filter.field] ?? {};
      return (
        <HStack spacing={8} align="center">
          <Input
            keyboardType="numeric"
            placeholder="Min"
            value={range.min !== undefined ? String(range.min) : ''}
            onChangeText={(text) => {
              if (text === '') {
                handleRangeFilterSelect(filter.field, { ...range, min: undefined });
                return;
              }
              const parsed = Number(text);
              if (Number.isNaN(parsed)) return;
              handleRangeFilterSelect(filter.field, {
                ...range,
                min: clampRangeValue(parsed, filter),
              });
            }}
            containerStyle={styles.rangeInput}
          />
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            -
          </Typography>
          <Input
            keyboardType="numeric"
            placeholder="Max"
            value={range.max !== undefined ? String(range.max) : ''}
            onChangeText={(text) => {
              if (text === '') {
                handleRangeFilterSelect(filter.field, { ...range, max: undefined });
                return;
              }
              const parsed = Number(text);
              if (Number.isNaN(parsed)) return;
              handleRangeFilterSelect(filter.field, {
                ...range,
                max: clampRangeValue(parsed, filter),
              });
            }}
            containerStyle={styles.rangeInput}
          />
        </HStack>
      );
    }

    if (resolvedType === 'text') {
      return (
        <Input
          value={selectedValues[filter.field] || ''}
          onChangeText={(text) => handleFilterSelect(filter.field, text || null)}
          placeholder={filter.label}
        />
      );
    }

    // No mobile date-picker atom exists yet - accepted by the type, unrendered
    if (
      resolvedType === 'date' ||
      resolvedType === 'daterange' ||
      resolvedType === 'date-range'
    ) {
      return null;
    }

    return (
      <Select
        value={selectedValues[filter.field] || 'all'}
        onChange={(newValue: string) => handleFilterSelect(filter.field, newValue)}
        options={selectOptions}
      />
    );
  };

  // Pills variant - horizontal toggle buttons
  if (variant === 'pills') {
    return (
      <HStack
        spacing={16}
        align="center"
        style={[styles.pillsContainer, style ?? {}]}
      >
        {showIcon && (
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            🔍
          </Typography>
        )}
        {filters.map((filter) => {
          const resolvedType = resolveFilterType(filter);
          // Pill buttons only make sense for a fixed option set; other
          // filterTypes fall back to the shared control renderer
          const usesOptionPills =
            resolvedType === undefined ||
            resolvedType === 'select' ||
            resolvedType === 'toggle' ||
            resolvedType === 'checkbox';

          return (
            <HStack key={filter.field} spacing={8} align="center">
              <Typography
                variant="caption"
                color={theme.colors['muted-foreground']}
              >
                {filter.label}:
              </Typography>
              {usesOptionPills ? (
                <HStack spacing={0} style={styles.pillGroup}>
                  <TouchableOpacity
                    onPress={() => handleFilterSelect(filter.field, null)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: !selectedValues[filter.field]
                          ? theme.colors.primary
                          : theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={{
                        color: !selectedValues[filter.field]
                          ? theme.colors['primary-foreground']
                          : theme.colors['muted-foreground'],
                      }}
                    >
                      All
                    </Typography>
                  </TouchableOpacity>
                  {filter.options?.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => handleFilterSelect(filter.field, option)}
                      style={[
                        styles.pill,
                        styles.pillWithBorder,
                        {
                          backgroundColor:
                            selectedValues[filter.field] === option
                              ? theme.colors.primary
                              : theme.colors.card,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Typography
                        variant="caption"
                        style={{
                          color:
                            selectedValues[filter.field] === option
                              ? theme.colors['primary-foreground']
                              : theme.colors['muted-foreground'],
                        }}
                      >
                        {option}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </HStack>
              ) : (
                renderFilterControl(filter)
              )}
            </HStack>
          );
        })}

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onPress={handleClearAll}>
            Clear
          </Button>
        )}
      </HStack>
    );
  }

  // Vertical variant - stacked filters for sidebars
  if (variant === 'vertical') {
    return (
      <VStack spacing={16} style={[styles.verticalContainer, style ?? {}]}>
        {showIcon && (
          <HStack spacing={8} align="center">
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              🔍
            </Typography>
            <Typography
              variant="label"
              color={theme.colors['muted-foreground']}
            >
              Filters
            </Typography>
          </HStack>
        )}
        {filters.map((filter) => (
          <VStack key={filter.field} spacing={4}>
            <Typography
              variant="label"
              color={theme.colors['muted-foreground']}
            >
              {filter.label}
            </Typography>
            {renderFilterControl(filter)}
          </VStack>
        ))}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onPress={handleClearAll}>
            Clear all
          </Button>
        )}
      </VStack>
    );
  }

  // Compact variant - smaller selects inline
  if (variant === 'compact') {
    return (
      <HStack
        spacing={12}
        align="center"
        style={[styles.compactContainer, style ?? {}]}
      >
        {showIcon && (
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            🔍
          </Typography>
        )}
        {filters.map((filter) => (
          <View key={filter.field} style={styles.compactSelect}>
            {renderFilterControl(filter, [
              { value: 'all', label: `All ${filter.label}` },
              ...(filter.options?.map((opt) => ({
                value: opt,
                label: opt,
              })) || []),
            ])}
          </View>
        ))}

        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <>
            {Object.entries(selectedValues).map(([field, value]) => {
              const filterDef = filters.find((f) => f.field === field);
              return (
                <TouchableOpacity
                  key={field}
                  onPress={() => handleFilterSelect(field, null)}
                >
                  <Badge variant="primary" size="md">
                    {filterDef?.label}: {value} ✕
                  </Badge>
                </TouchableOpacity>
              );
            })}
            <Button variant="ghost" size="sm" onPress={handleClearAll}>
              Clear all
            </Button>
          </>
        )}
      </HStack>
    );
  }

  // Default variant - labeled selects with clear visual hierarchy
  return (
    <View
      style={[
        styles.defaultContainer,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <HStack spacing={16} align="center" style={styles.defaultContent}>
        {showIcon && (
          <HStack spacing={8} align="center">
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              🔍
            </Typography>
            <Typography
              variant="label"
              color={theme.colors['muted-foreground']}
            >
              Filters
            </Typography>
          </HStack>
        )}

        {/* Filter controls */}
        {filters.map((filter) => (
          <VStack key={filter.field} spacing={4}>
            <Typography
              variant="label"
              color={theme.colors['muted-foreground']}
            >
              {filter.label}
            </Typography>
            {renderFilterControl(filter)}
          </VStack>
        ))}

        {/* Active filter count and clear */}
        {activeFilterCount > 0 && (
          <HStack spacing={12} align="center" style={styles.clearSection}>
            <Badge variant="primary" size="md">
              {activeFilterCount} active
            </Badge>
            <Button variant="ghost" size="sm" onPress={handleClearAll}>
              Clear all
            </Button>
          </HStack>
        )}
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  pillsContainer: {
    flexWrap: 'wrap',
  },
  pillGroup: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillWithBorder: {
    borderLeftWidth: 1,
  },
  verticalContainer: {
    width: '100%',
  },
  compactContainer: {
    flexWrap: 'wrap',
  },
  compactSelect: {
    minWidth: 120,
  },
  rangeInput: {
    width: 84,
  },
  defaultContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  defaultContent: {
    flexWrap: 'wrap',
  },
  clearSection: {
    marginLeft: 'auto',
  },
});

FilterGroup.displayName = 'FilterGroup';
