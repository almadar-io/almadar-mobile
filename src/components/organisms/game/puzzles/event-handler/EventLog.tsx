/**
 * EventLog Component
 *
 * Scrolling log of events during playback in the Event Handler tier.
 * Shows the chain reaction as events cascade through objects.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { Typography } from '../../../../atoms/Typography';
import { VStack, HStack } from '../../../../atoms/Stack';
import { Card } from '../../../../atoms/Card';

export interface EventLogEntry {
  id: string;
  timestamp: number;
  icon: string;
  message: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export interface EventLogProps {
  /** Log entries */
  entries: EventLogEntry[];
  /** Max visible height before scroll */
  maxHeight?: number;
  /** Title label */
  label?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

const STATUS_STYLES = {
  pending: 'muted-foreground',
  active: 'primary',
  done: 'success',
  error: 'error',
} as const;

const STATUS_DOTS: Record<string, string> = {
  pending: '○',
  active: '●',
  done: '✓',
  error: '✗',
};

export const EventLog: React.FC<EventLogProps> = ({
  entries,
  maxHeight = 200,
  label = 'Event Log',
  style,
}) => {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current && entries.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [entries.length]);

  const getStatusColor = (status: EventLogEntry['status']): string => {
    const colorKey = STATUS_STYLES[status];
    return theme.colors[colorKey] || theme.colors.foreground;
  };

  return (
    <Card style={style ? [styles.container, style] : styles.container}>
      <VStack spacing={8}>
        <Typography variant="body" style={{ color: theme.colors['muted-foreground'], fontWeight: '500' }}>
          {label}
        </Typography>
        <ScrollView
          ref={scrollRef}
          style={[styles.scrollView, { maxHeight }]}
          contentContainerStyle={styles.scrollContent}
        >
          <VStack spacing={8}>
            {entries.length === 0 && (
              <Typography variant="caption" style={{ color: theme.colors['muted-foreground'], fontStyle: 'italic' }}>
                No events yet...
              </Typography>
            )}
            {entries.map((entry) => (
              <HStack key={entry.id} spacing={8} align="flex-start">
                <Typography
                  variant="caption"
                  style={{ color: getStatusColor(entry.status) }}
                >
                  {STATUS_DOTS[entry.status]}
                </Typography>
                <Typography variant="caption">
                  {entry.icon}
                </Typography>
                <Typography
                  variant="caption"
                  style={[styles.message, { color: getStatusColor(entry.status) }]}
                >
                  {entry.message}
                </Typography>
              </HStack>
            ))}
          </VStack>
        </ScrollView>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  message: {
    flex: 1,
  } as ViewStyle,
});

EventLog.displayName = 'EventLog';
