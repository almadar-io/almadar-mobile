import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'current' | 'pending';
}

export interface TimelineProps {
  entity: TimelineItem[];
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const Timeline: React.FC<TimelineProps> = ({
  entity,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();

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
    <VStack spacing={0} style={[styles.container, style as ViewStyle]}>
      {entity.map((item, index) => {
        const isLast = index === entity.length - 1;
        const status = item.status || (index === 0 ? 'current' : 'pending');
        
        const statusColors = {
          completed: theme.colors.success,
          current: theme.colors.primary,
          pending: theme.colors['muted-foreground'],
        };

        const dotColor = statusColors[status];

        return (
          <HStack key={item.id} spacing={12} style={styles.item}>
            <VStack align="center" style={styles.lineContainer}>
              <View 
                style={[
                  styles.dot, 
                  { 
                    backgroundColor: dotColor,
                    borderColor: dotColor,
                  } 
                ]} 
              />
              {!isLast && (
                <View 
                  style={[
                    styles.line, 
                    { backgroundColor: theme.colors.border }
                  ]} 
                />
              )}
            </VStack>

            <VStack spacing={2} style={styles.content}>
              <Typography variant="body" style={{ color: theme.colors.foreground }}>
                {item.title}
              </Typography>
              {item.description && (
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                  {item.description}
                </Typography>
              )}
              {item.timestamp && (
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                  {item.timestamp}
                </Typography>
              )}
            </VStack>
          </HStack>
        );
      })}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    paddingBottom: 16,
  },
  lineContainer: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
});

Timeline.displayName = 'Timeline';
