import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { DayCell } from '../atoms/DayCell';
import { VStack, HStack } from '../atoms/Stack';
import { Icon } from '../atoms/Icon';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  color?: string;
}

export interface CalendarGridProps {
  weekStart?: 0 | 1;
  events?: CalendarEvent[];
  onSlotClick?: (date: string) => void;
  slotClickEvent?: string;
  initialMonth?: number;
  initialYear?: number;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

const DAY_LABELS_SUN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS_MON = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weekStart = 0,
  events = [],
  onSlotClick,
  slotClickEvent,
  initialMonth,
  initialYear,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const now = new Date();
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;

  const dayLabels = weekStart === 1 ? DAY_LABELS_MON : DAY_LABELS_SUN;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startOffset = firstDay.getDay() - weekStart;
    if (startOffset < 0) startOffset += 7;

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);

    return days;
  }, [year, month, weekStart]);

  const eventDates = useMemo(() => {
    const set = new Set<number>();
    events.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [events, month, year]);

  const handleDayPress = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    onSlotClick?.(dateStr);
    if (slotClickEvent) {
      eventBus.emit(`UI:${slotClickEvent}`, { date: dateStr });
    }
  };

  const goToPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const today = now.getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <VStack spacing={theme.spacing[3]} style={style}>
      <HStack spacing={theme.spacing[2]} align="center" style={styles.header}>
        <Pressable onPress={goToPrevMonth} style={styles.navButton}>
          <Icon name="chevron-left" size={20} color={theme.colors.foreground} />
        </Pressable>
        <Typography variant="h4" style={{ color: theme.colors.foreground, flex: 1, textAlign: 'center' }}>
          {monthNames[month]} {year}
        </Typography>
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <Icon name="chevron-right" size={20} color={theme.colors.foreground} />
        </Pressable>
      </HStack>

      <HStack spacing={0} align="center" style={styles.dayLabelsRow}>
        {dayLabels.map((label, i) => (
          <View key={i} style={styles.dayLabelCell}>
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], textAlign: 'center', fontWeight: '600' }}>
              {label}
            </Typography>
          </View>
        ))}
      </HStack>

      <ScrollView>
        {weeks.map((week, wi) => (
          <HStack key={wi} spacing={0} align="center">
            {week.map((day, di) => (
              <View key={di} style={styles.cellWrapper}>
                {day !== null ? (
                  <DayCell
                    date={day}
                    isToday={isCurrentMonth && day === today}
                    isSelected={
                      selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    }
                    hasEvents={eventDates.has(day)}
                    onClick={() => handleDayPress(day)}
                  />
                ) : (
                  <View style={styles.emptyCell} />
                )}
              </View>
            ))}
          </HStack>
        ))}
      </ScrollView>
    </VStack>
  );
};

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  navButton: {
    padding: 8,
  },
  dayLabelsRow: {
    justifyContent: 'space-around',
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  cellWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  emptyCell: {
    width: 40,
    height: 40,
  },
});

CalendarGrid.displayName = 'CalendarGrid';
