import { useState, useCallback } from 'react';
import { RefreshControlProps } from 'react-native';

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
}

export interface UsePullToRefreshReturn {
  refreshing: boolean;
  onRefresh: () => void;
  refreshControlProps: Pick<RefreshControlProps, 'refreshing' | 'onRefresh'>;
}

/**
 * Hook for implementing pull-to-refresh functionality.
 * 
 * @example
 * ```tsx
 * const { refreshControlProps } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetchData();
 *   }
 * });
 * 
 * return (
 *   <ScrollView refreshControl={<RefreshControl {...refreshControlProps} />}>
 *     {content}
 *   </ScrollView>
 * );
 * ```
 */
export function usePullToRefresh(
  options: UsePullToRefreshOptions
): UsePullToRefreshReturn {
  const { onRefresh } = options;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    refreshControlProps: {
      refreshing,
      onRefresh: handleRefresh,
    },
  };
}
