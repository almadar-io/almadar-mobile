import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
  /** Declarative submit event name - emits UI:${submitEvent} via eventBus */
  submitEvent?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  autoFocus = false,
  style,
  isLoading,
  error,
  changeEvent,
  submitEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleChangeText = (text: string) => {
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { value: text });
    }
    onChange?.(text);
  };

  const handleSubmit = () => {
    if (submitEvent) {
      eventBus.emit(`UI:${submitEvent}`, { value });
    }
    onSubmit?.();
  };

  const handleClear = () => {
    handleChangeText('');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style as ViewStyle]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style as ViewStyle]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <HStack 
      spacing={8} 
      align="center" 
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style as ViewStyle,
      ]}
    >
      <Typography variant="body" style={{ color: theme.colors['muted-foreground'] }}>
        🔍
      </Typography>
      
      <TextInput
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.colors['muted-foreground']}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={[
          styles.input,
          { color: theme.colors.foreground },
        ]}
      />
      
      {value && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clear}>
          <Typography variant="body" style={{ color: theme.colors['muted-foreground'] }}>
            ✕
          </Typography>
        </TouchableOpacity>
      )}
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clear: {
    padding: 4,
  },
});

SearchInput.displayName = 'SearchInput';
