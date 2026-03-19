import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';

export interface PullToRefreshProps {
  refreshEvent?: string;
  refreshPayload?: Record<string, unknown>;
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshEvent,
  refreshPayload,
  onRefresh,
  children,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshEvent) {
      eventBus.emit(`UI:${refreshEvent}`, refreshPayload);
    }
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  }, [refreshEvent, refreshPayload, onRefresh, eventBus]);

  return (
    <ScrollView
      style={[styles.container, style]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

PullToRefresh.displayName = 'PullToRefresh';
