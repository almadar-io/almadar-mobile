// Re-export hooks from @almadar/ui
export { useEventBus } from './useEventBus';
export { useTraitState } from './useTraitState';
export { useUIEvents } from './useUIEvents';

// RN-specific hooks
export { useNavigation, useParams } from './useNavigation';
export type { NavigationOptions } from './useNavigation';

export { useKeyboard, useKeyboardHeight } from './useKeyboard';
export type { KeyboardState } from './useKeyboard';

// Theme hooks
export { useThemeStyles, useThemeValue } from './useThemeStyles';

// Navigation hooks
export { useScrollHeader } from './useScrollHeader';
export type { UseScrollHeaderOptions, UseScrollHeaderReturn } from './useScrollHeader';

export { useSafeAreaInsets } from './useSafeAreaInsets';
export type { SafeAreaInsets } from './useSafeAreaInsets';

// Data hooks
export { usePullToRefresh } from './usePullToRefresh';
export type { UsePullToRefreshOptions, UsePullToRefreshReturn } from './usePullToRefresh';

export { useInfiniteScroll } from './useInfiniteScroll';
export type { UseInfiniteScrollOptions, UseInfiniteScrollReturn } from './useInfiniteScroll';
