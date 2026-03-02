import { useState, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface UseInfiniteScrollOptions {
  onLoadMore: () => Promise<void> | void;
  hasMore: boolean;
  threshold?: number;
}

export interface UseInfiniteScrollReturn {
  loadingMore: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/**
 * Hook for implementing infinite scroll functionality.
 * 
 * @example
 * ```tsx
 * const { loadingMore, onScroll } = useInfiniteScroll({
 *   onLoadMore: async () => {
 *     await loadNextPage();
 *   },
 *   hasMore: hasNextPage,
 * });
 * 
 * return (
 *   <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
 *     {items.map(renderItem)}
 *     {loadingMore && <ActivityIndicator />}
 *   </ScrollView>
 * );
 * ```
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn {
  const { onLoadMore, hasMore, threshold = 100 } = options;
  const [loadingMore, setLoadingMore] = useState(false);

  const onScroll = useCallback(
    async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (loadingMore || !hasMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const isCloseToBottom = 
        layoutMeasurement.height + contentOffset.y >= 
        contentSize.height - threshold;

      if (isCloseToBottom) {
        setLoadingMore(true);
        try {
          await onLoadMore();
        } finally {
          setLoadingMore(false);
        }
      }
    },
    [loadingMore, hasMore, threshold, onLoadMore]
  );

  return {
    loadingMore,
    onScroll,
  };
}
