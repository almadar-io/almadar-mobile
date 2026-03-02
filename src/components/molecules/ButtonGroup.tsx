import React from 'react';
import { 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';

export interface ButtonGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  options,
  value,
  onChange,
  style,
  changeEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = (optionValue: string) => {
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { value: optionValue });
    }
    onChange?.(optionValue);
  };

  return (
    <HStack spacing={4} style={style ? [styles.container, style] : styles.container}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handlePress(option.value)}
            disabled={option.disabled}
            style={[
              styles.button,
              {
                backgroundColor: isSelected 
                  ? theme.colors.primary 
                  : theme.colors.card,
                borderColor: theme.colors.border,
                opacity: option.disabled ? 0.5 : 1,
              },
            ]}
          >
            <Typography 
              variant="body" 
              style={{ 
                color: isSelected 
                  ? theme.colors['primary-foreground'] 
                  : theme.colors.foreground 
              }}
            >
              {option.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});

ButtonGroup.displayName = 'ButtonGroup';
