import { useCallback } from 'react';
import { useNavigation as useRNNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp, ParamListBase } from '@react-navigation/native';

export interface NavigationOptions {
  replace?: boolean;
  reset?: boolean;
}

/**
 * Hook for navigation in React Native apps.
 * 
 * This hook wraps React Navigation's useNavigation and useRoute
 * with a simpler API for common navigation patterns.
 * 
 * @example
 * // With typed navigation (recommended)
 * type RootStackParamList = {
 *   Home: undefined;
 *   Profile: { userId: string };
 * };
 * const navigation = useNavigation<RootStackParamList>();
 * 
 * // Navigate to a screen
 * navigation.navigateTo('Profile', { userId: '123' });
 * 
 * // Get a route param
 * const userId = navigation.getParam<string>('userId');
 */
export function useNavigation<T extends ParamListBase = ParamListBase>() {
  // Cast to NavigationProp<T> for generic type support
  // The actual React Navigation hook returns more specific types based on context
  const navigation = useRNNavigation<NavigationProp<T>>();
  const route = useRoute<RouteProp<T, keyof T>>();

  const navigateTo = useCallback(<K extends keyof T>(
    screenName: K,
    params?: T[K],
    options?: NavigationOptions
  ): void => {
    const screen = String(screenName);
    
    if (options?.replace) {
      // Stack navigator specific - cast for compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).replace(screen, params);
    } else if (options?.reset) {
      navigation.reset({
        index: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        routes: [{ name: screen, params } as any],
      });
    } else {
      // Use navigation.navigate with proper typing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation.navigate as any)(screen, params);
    }
  }, [navigation]);

  const goBack = useCallback((): void => {
    navigation.goBack();
  }, [navigation]);

  const getParam = useCallback(<V,>(key: string, defaultValue?: V): V | undefined => {
    // Route params come as unknown from React Navigation
    // Cast to Record for safe property access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = route.params as Record<string, any> | undefined;
    return params?.[key] ?? defaultValue;
  }, [route.params]);

  return {
    navigateTo,
    goBack,
    getParam,
    currentRoute: String(route.name),
    // Route params come as unknown from React Navigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: route.params as Record<string, any> | undefined,
  };
}

/**
 * Hook to access route params directly with type safety.
 * 
 * @example
 * type ProfileParams = { userId: string; name?: string };
 * const { userId, name } = useParams<ProfileParams>();
 */
export function useParams<T extends Record<string, unknown>>(): T {
  const route = useRoute();
  // Route params from React Navigation are typed as object | undefined
  // Cast to consumer's expected type for type safety
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (route.params as any) || ({} as T);
}
