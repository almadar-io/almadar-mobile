import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
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
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
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
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
  /** Payload base to include with the change event */
  actionPayload?: Record<string, unknown>;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  style,
  textStyle,
  isLoading,
  error,
  changeEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { ...actionPayload, value: selectedValue });
    }
    onChange?.(selectedValue);
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (!disabled && !isLoading) {
      setIsOpen(true);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
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
    <>
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
          style,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: selectedOption 
                ? theme.colors.foreground 
                : theme.colors['muted-foreground'],
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={[styles.chevron, { color: theme.colors['muted-foreground'] }]}>
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={[styles.closeButton, { color: theme.colors.primary }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  {
                    backgroundColor: item.value === value 
                      ? theme.colors.primary 
                      : theme.colors.card,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleSelect(item.value)}
              >
                <Text
                  style={{
                    color: item.value === value 
                      ? theme.colors['primary-foreground'] 
                      : theme.colors.foreground,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
  },
});

Select.displayName = 'Select';
