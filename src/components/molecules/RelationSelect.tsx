import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

export interface RelationOption {
  id: string;
  label: string;
  subtitle?: string;
  avatarUri?: string;
  metadata?: Record<string, string>;
}

export interface RelationSelectProps {
  options: RelationOption[];
  value?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Show search input for filtering */
  searchable?: boolean;
  /** Maximum number of selections (for multiple mode) */
  maxSelections?: number;
  /** Event name to emit on selection change - emits UI:${changeEvent} */
  changeEvent?: string;
  /** Event name to emit on search - emits UI:${searchEvent} */
  searchEvent?: string;
  /** Payload base to include with events */
  actionPayload?: Record<string, unknown>;
}

export const RelationSelect: React.FC<RelationSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  style,
  textStyle,
  isLoading,
  error,
  entity,
  multiple = false,
  searchable = true,
  maxSelections,
  changeEvent,
  searchEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  }, [value, multiple]);

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => selectedValues.includes(opt.id));
  }, [options, selectedValues]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.subtitle?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchEvent) {
      eventBus.emit(`UI:${searchEvent}`, { ...actionPayload, query, entity });
    }
  };

  const handleSelect = (selectedId: string) => {
    if (multiple) {
      const currentValues = selectedValues;
      let newValues: string[];

      if (currentValues.includes(selectedId)) {
        newValues = currentValues.filter((id) => id !== selectedId);
      } else {
        if (maxSelections && currentValues.length >= maxSelections) {
          return;
        }
        newValues = [...currentValues, selectedId];
      }

      if (changeEvent) {
        eventBus.emit(`UI:${changeEvent}`, {
          ...actionPayload,
          value: newValues,
          entity,
        });
      }
      onChange?.(newValues);
    } else {
      if (changeEvent) {
        eventBus.emit(`UI:${changeEvent}`, {
          ...actionPayload,
          value: selectedId,
          entity,
        });
      }
      onChange?.(selectedId);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    if (multiple) {
      if (changeEvent) {
        eventBus.emit(`UI:${changeEvent}`, { ...actionPayload, value: [], entity });
      }
      onChange?.([]);
    } else {
      if (changeEvent) {
        eventBus.emit(`UI:${changeEvent}`, { ...actionPayload, value: undefined, entity });
      }
      onChange?.('');
    }
  };

  const handleOpen = () => {
    if (!disabled && !isLoading) {
      setSearchQuery('');
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const renderOption = ({ item }: { item: RelationOption }): React.ReactElement => {
    const isSelected = selectedValues.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: isSelected
              ? theme.colors.primary
              : theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
        onPress={() => handleSelect(item.id)}
      >
        <HStack spacing={12} align="center">
          {item.avatarUri ? (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: isSelected
                    ? theme.colors['primary-foreground']
                    : theme.colors.muted,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: isSelected
                    ? theme.colors['primary-foreground']
                    : theme.colors.muted,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>
                {item.label.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <VStack spacing={2} style={styles.optionContent}>
            <Text
              style={[
                styles.optionLabel,
                {
                  color: isSelected
                    ? theme.colors['primary-foreground']
                    : theme.colors.foreground,
                },
                textStyle,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.subtitle && (
              <Text
                style={[
                  styles.optionSubtitle,
                  {
                    color: isSelected
                      ? `${theme.colors['primary-foreground']}99`
                      : theme.colors['muted-foreground'],
                  },
                ]}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            )}
          </VStack>

          {isSelected && (
            <Typography
              variant="body"
              style={{ color: theme.colors['primary-foreground'] }}
            >
              ✓
            </Typography>
          )}
        </HStack>

        {item.metadata && (
          <HStack spacing={8} style={styles.metadata}>
            {Object.entries(item.metadata).map(([key, val]) => (
              <Badge
                key={key}
                variant={isSelected ? 'secondary' : 'default'}
                size="sm"
              >
                {val}
              </Badge>
            ))}
          </HStack>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading options..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Trigger button */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.buttonContent}>
          {selectedOptions.length === 0 ? (
            <Text
              style={[
                styles.buttonText,
                {
                  color: theme.colors['muted-foreground'],
                },
                textStyle,
              ]}
              numberOfLines={1}
            >
              {placeholder}
            </Text>
          ) : (
            <HStack spacing={8} style={styles.selectedContainer}>
              {selectedOptions.map((opt) => (
                <View
                  key={opt.id}
                  style={[
                    styles.selectedChip,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectedChipText,
                      { color: theme.colors['primary-foreground'] },
                    ]}
                    numberOfLines={1}
                  >
                    {opt.label}
                  </Text>
                </View>
              ))}
              {multiple && maxSelections && (
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                  {selectedOptions.length}/{maxSelections}
                </Typography>
              )}
            </HStack>
          )}
        </View>

        {selectedOptions.length > 0 && !disabled && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Typography
              variant="body"
              style={{ color: theme.colors['muted-foreground'] }}
            >
              ✕
            </Typography>
          </TouchableOpacity>
        )}

        <Text style={[styles.chevron, { color: theme.colors['muted-foreground'] }]}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Button variant="ghost" onPress={handleClose}>
              Cancel
            </Button>
            <Typography variant="h4" style={{ color: theme.colors.foreground }}>
              {multiple ? 'Select Items' : 'Select Item'}
            </Typography>
            <Button variant="primary" onPress={handleClose}>
              Done
            </Button>
          </View>

          {/* Search */}
          {searchable && (
            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Search..."
                changeEvent={searchEvent}
              />
            </View>
          )}

          {/* Options list */}
          {filteredOptions.length === 0 ? (
            <EmptyState message="No matching options" />
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderOption}
              contentContainerStyle={styles.listContent}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  buttonContent: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
  },
  selectedContainer: {
    flexWrap: 'wrap',
    flex: 1,
  },
  selectedChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  selectedChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  chevron: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchContainer: {
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadata: {
    marginTop: 8,
    marginLeft: 52,
  },
});

RelationSelect.displayName = 'RelationSelect';
