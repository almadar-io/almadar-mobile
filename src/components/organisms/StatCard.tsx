import React from 'react';
import { 
  View, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
  action?: string;
  actionPayload?: Record<string, unknown>;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  onPress,
  action,
  actionPayload,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = () => {
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload);
    }
    onPress?.();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  const trendColors = {
    up: theme.colors.success,
    down: theme.colors.error,
    neutral: theme.colors['muted-foreground'],
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const Content = (
    <VStack spacing={8} style={styles.content}>
      <View style={styles.header}>
        <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
          {title}
        </Typography>
        {icon && <View>{icon}</View>}
      </View>

      <Typography variant="h2" style={{ color: theme.colors.foreground }}>
        {value}
      </Typography>

      {(subtitle || trend) && (
        <View style={styles.footer}>
          {subtitle && (
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Typography 
              variant="caption" 
              style={{ color: trendColors[trend] }}
            >
              {trendIcons[trend]} {trendValue}
            </Typography>
          )}
        </View>
      )}
    </VStack>
  );

  if (onPress || action) {
    return (
      <TouchableOpacity 
        onPress={handlePress}
        style={[
          styles.container, 
          { backgroundColor: theme.colors.card },
          theme.shadows.sm,
          style,
        ]}
      >
        {Content}
      </TouchableOpacity>
    );
  }

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.card },
        theme.shadows.sm,
        style,
      ]}
    >
      {Content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});

StatCard.displayName = 'StatCard';
