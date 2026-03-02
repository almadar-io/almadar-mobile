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
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { HStack, VStack } from '../atoms/Stack';

/** Filter definition from schema */
export interface FilterDefinition {
  field: string;
  label: string;
  /** Filter type */
  filterType?: 'select' | 'toggle' | 'checkbox';
  /** Alias for filterType (schema compatibility) */
  type?: 'select' | 'toggle' | 'checkbox';
  /** Options for select/toggle filters */
  options?: readonly string[];
}

export interface FilterGroupProps {
  /** Entity name to filter */
  entity: string;
  /** Filter definitions from schema */
  filters: readonly FilterDefinition[];
  /** Callback when a filter changes - for EntityStore integration */
  onFilterChange?: (field: string, value: string | null) => void;
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

  const handleClearAll = useCallback(() => {
    setSelectedValues({});

    // Call callback if provided (for backward compat)
    onClearAll?.();

    // Emit UI:CLEAR_FILTERS event for closed circuit
    eventBus.emit('UI:CLEAR_FILTERS', { entity, query });
  }, [onClearAll, eventBus, entity, query]);

  const activeFilterCount = Object.keys(selectedValues).length;

  const buildSelectOptions = (filter: FilterDefinition): SelectOption[] => {
    return [
      { value: 'all', label: 'All' },
      ...(filter.options?.map((opt) => ({
        value: opt,
        label: opt,
      })) || []),
    ];
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
        {filters.map((filter) => (
          <HStack key={filter.field} spacing={8} align="center">
            <Typography
              variant="caption"
              color={theme.colors['muted-foreground']}
            >
              {filter.label}:
            </Typography>
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
          </HStack>
        ))}

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
            <Select
              value={selectedValues[filter.field] || 'all'}
              onChange={(newValue: string) =>
                handleFilterSelect(filter.field, newValue)
              }
              options={buildSelectOptions(filter)}
            />
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
            <Select
              value={selectedValues[filter.field] || 'all'}
              onChange={(newValue: string) =>
                handleFilterSelect(filter.field, newValue)
              }
              options={[
                { value: 'all', label: `All ${filter.label}` },
                ...(filter.options?.map((opt) => ({
                  value: opt,
                  label: opt,
                })) || []),
              ]}
            />
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

        {/* Filter selects */}
        {filters.map((filter) => (
          <VStack key={filter.field} spacing={4}>
            <Typography
              variant="label"
              color={theme.colors['muted-foreground']}
            >
              {filter.label}
            </Typography>
            <Select
              value={selectedValues[filter.field] || 'all'}
              onChange={(newValue: string) =>
                handleFilterSelect(filter.field, newValue)
              }
              options={buildSelectOptions(filter)}
            />
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
