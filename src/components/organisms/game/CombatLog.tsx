import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { Card } from '../../atoms/Card';
import { Badge } from '../../atoms/Badge';
import { Typography } from '../../atoms/Typography';
import { HStack, VStack } from '../../atoms/Stack';

export type CombatLogEventType = 'attack' | 'defend' | 'heal' | 'move' | 'special' | 'death' | 'spawn';

export interface CombatEvent {
  id: string;
  type: CombatLogEventType;
  message: string;
  timestamp: number;
  actorName?: string;
  targetName?: string;
  value?: number;
  turn?: number;
}

export interface CombatLogProps {
  events: CombatEvent[];
  maxVisible?: number;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  title?: string;
  style?: ViewStyle;
}

const eventIcons: Record<CombatLogEventType, string> = {
  attack: '⚔️',
  defend: '🛡️',
  heal: '❤️',
  move: '🏃',
  special: '⚡',
  death: '💀',
  spawn: '✨',
};

const eventColors: Record<CombatLogEventType, string> = {
  attack: '#ef4444',
  defend: '#3b82f6',
  heal: '#22c55e',
  move: '#14b8a6',
  special: '#eab308',
  death: '#6b7280',
  spawn: '#a855f7',
};

const eventBadgeVariants: Record<CombatLogEventType, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  attack: 'error',
  defend: 'primary',
  heal: 'success',
  move: 'warning',
  special: 'default',
  death: 'default',
  spawn: 'default',
};

export const CombatLog: React.FC<CombatLogProps> = ({
  events,
  maxVisible = 50,
  autoScroll = true,
  showTimestamps = false,
  title = 'Combat Log',
  style,
}) => {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [events, autoScroll]);

  const visibleEvents = events.slice(-maxVisible);

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <HStack justify="space-between" align="center">
          <Typography variant="body" style={{ fontWeight: '700' }}>
            {title}
          </Typography>
          <Badge variant="default" size="sm">
            {events.length} events
          </Badge>
        </HStack>
      </View>
      
      <ScrollView 
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {visibleEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="caption" style={{ opacity: 0.5 }}>
              No events yet
            </Typography>
          </View>
        ) : (
          <VStack spacing={4}>
            {visibleEvents.map((event) => (
              <HStack 
                key={event.id} 
                spacing={8} 
                align="flex-start"
                style={[
                  styles.eventRow,
                  ...(event.type === 'death' ? [{ opacity: 0.6 }] : []),
                ]}
              >
                <Text style={{ 
                  fontSize: 16, 
                  color: eventColors[event.type],
                  marginTop: 2,
                }}>
                  {eventIcons[event.type]}
                </Text>
                
                <VStack spacing={4} style={styles.eventContent}>
                  <Typography variant="caption">
                    {event.message}
                  </Typography>
                  
                  {event.value !== undefined && (
                    <Badge 
                      variant={eventBadgeVariants[event.type]} 
                      size="sm"
                    >
                      {event.type === 'heal' ? '+' : event.type === 'attack' ? '-' : ''}{event.value}
                    </Badge>
                  )}
                </VStack>

                {(event.turn || showTimestamps) && (
                  <Typography 
                    variant="caption" 
                    style={{ opacity: 0.4 }}
                  >
                    {event.turn ? `T${event.turn}` : ''}
                  </Typography>
                )}
              </HStack>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
  },
  scrollView: {
    maxHeight: 256,
  },
  content: {
    padding: 8,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  eventRow: {
    padding: 8,
    borderRadius: 4,
  },
  eventContent: {
    flex: 1,
  },
});

CombatLog.displayName = 'CombatLog';
