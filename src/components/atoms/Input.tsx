import React from 'react';
import { 
  TextInput, 
  TextInputProps, 
  StyleSheet, 
  View, 
  Text,
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { LoadingState } from '../molecules/LoadingState';

export interface InputProps extends Omit<TextInputProps, 'onChange'> {
  label?: string;
  /** String error message for form validation */
  errorMessage?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state object */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
  /** Declarative focus event name - emits UI:${focusEvent} via eventBus */
  focusEvent?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  errorMessage,
  helperText,
  containerStyle,
  style,
  isLoading,
  error,
  changeEvent,
  focusEvent,
  onChangeText,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleChangeText = (text: string) => {
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { value: text });
    }
    onChangeText?.(text);
  };

  const handleFocus = () => {
    if (focusEvent) {
      eventBus.emit(`UI:${focusEvent}`);
    }
    onFocus?.({} as never);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: theme.colors.foreground }]}>
            {label}
          </Text>
        )}
        <LoadingState message="Loading..." />
      </View>
    );
  }

  const errorText = error?.message || errorMessage;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.foreground }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: errorText ? theme.colors.error : theme.colors.border,
            backgroundColor: theme.colors.card,
            color: theme.colors.foreground,
          },
          style,
        ]}
        placeholderTextColor={theme.colors['muted-foreground']}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={onBlur}
        {...textInputProps}
      />
      {errorText ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: theme.colors['muted-foreground'] }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});

Input.displayName = 'Input';
