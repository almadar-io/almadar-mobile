import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useEventBus } from '../../hooks/useEventBus';
import { Spinner } from './Spinner';
import { Typography } from './Typography';
import { useTheme } from '../../providers/ThemeContext';

export interface InfiniteScrollSentinelProps {
  loadMoreEvent?: string;
  loadMorePayload?: Record<string, unknown>;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  style?: ViewStyle;
  error?: Error | null;
  entity?: string;
}

export const InfiniteScrollSentinel: React.FC<InfiniteScrollSentinelProps> = ({
  loadMoreEvent,
  loadMorePayload,
  isLoading = false,
  hasMore = true,
  onLoadMore,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  useEffect(() => {
    if (hasMore && !isLoading) {
      if (loadMoreEvent) {
        eventBus.emit(`UI:${loadMoreEvent}`, loadMorePayload);
      }
      onLoadMore?.();
    }
  }, [hasMore, isLoading, loadMoreEvent, loadMorePayload, onLoadMore, eventBus]);

  if (!hasMore) {
    return (
      <View style={[styles.container, style]}>
        <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
          No more items
        </Typography>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <Spinner size="sm" />
      </View>
    );
  }

  return <View style={[styles.sentinel, style]} />;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentinel: {
    height: 1,
  },
});

InfiniteScrollSentinel.displayName = 'InfiniteScrollSentinel';
