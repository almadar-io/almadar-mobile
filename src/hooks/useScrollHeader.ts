import { useState, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface UseScrollHeaderOptions {
  threshold?: number;
}

export interface UseScrollHeaderReturn {
  isCollapsed: boolean;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/**
 * Hook for creating collapsible header behavior on scroll.
 * 
 * @example
 * ```tsx
 * const { isCollapsed, onScroll } = useScrollHeader({ threshold: 50 });
 * 
 * return (
 *   <>
 *     <Header 
 *       title="My Page" 
 *       style={{ 
 *         height: isCollapsed ? 40 : 56,
 *         opacity: isCollapsed ? 0.9 : 1
 *       }} 
 *     />
 *     <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
 *       {content}
 *     </ScrollView>
 *   </>
 * );
 * ```
 */
export function useScrollHeader(
  options: UseScrollHeaderOptions = {}
): UseScrollHeaderReturn {
  const { threshold = 50 } = options;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const shouldCollapse = offsetY > threshold;
      
      if (shouldCollapse !== isCollapsed) {
        setIsCollapsed(shouldCollapse);
      }
    },
    [threshold, isCollapsed]
  );

  return { isCollapsed, onScroll };
}
