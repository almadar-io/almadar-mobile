import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Hook to get safe area insets for handling notched devices.
 * Uses screen dimensions to estimate safe areas.
 * 
 * Note: For production apps, consider using react-native-safe-area-context
 * which provides the actual safe area insets from the native platform.
 * 
 * @example
 * ```tsx
 * const insets = useSafeAreaInsets();
 * 
 * return (
 *   <View style={{ 
 *     paddingTop: insets.top,
 *     paddingBottom: insets.bottom 
 *   }}>
 *     {children}
 *   </View>
 * );
 * ```
 */
export function useSafeAreaInsets(): SafeAreaInsets {
  const [screen, setScreen] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
    });

    return () => subscription?.remove();
  }, []);

  // Estimate safe areas based on common device dimensions
  // iPhone X and later have 44pt top and 34pt bottom safe areas
  // Other devices typically have 20pt top (status bar) and 0 bottom
  const isIPhoneXOrLater = 
    screen.height >= 812 || screen.width >= 812;

  return {
    top: isIPhoneXOrLater ? 44 : 20,
    bottom: isIPhoneXOrLater ? 34 : 0,
    left: 0,
    right: 0,
  };
}
