import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from './Typography';

export interface DayCellProps {
  date: number;
  isToday?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  hasEvents?: boolean;
  onClick?: () => void;
  action?: string;
  actionPayload?: Record<string, unknown>;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const DayCell: React.FC<DayCellProps> = ({
  date,
  isToday = false,
  isSelected = false,
  isDisabled = false,
  hasEvents = false,
  onClick,
  action,
  actionPayload,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = () => {
    if (isDisabled) return;
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload);
    }
    onClick?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.cell,
        {
          borderRadius: theme.borderRadius.md,
        },
        isToday && {
          borderWidth: 2,
          borderColor: theme.colors.primary,
        },
        isSelected && {
          backgroundColor: theme.colors.primary,
        },
        isDisabled && {
          opacity: 0.3,
        },
        style,
      ]}
    >
      <Typography
        variant="body"
        style={[
          styles.dateText,
          {
            color: isSelected
              ? theme.colors['primary-foreground']
              : isDisabled
                ? theme.colors['muted-foreground']
                : theme.colors.foreground,
          },
        ]}
      >
        {date}
      </Typography>
      {hasEvents && (
        <Pressable
          style={[
            styles.eventDot,
            {
              backgroundColor: isSelected
                ? theme.colors['primary-foreground']
                : theme.colors.primary,
            },
          ]}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

DayCell.displayName = 'DayCell';
