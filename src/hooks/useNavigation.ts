import { useCallback } from 'react';
import { useNavigation as useRNNavigation, useRoute } from '@react-navigation/native';

export interface NavigationOptions {
  replace?: boolean;
  reset?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNavigation<T extends Record<string, unknown> = Record<string, any>>() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useRNNavigation<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route = useRoute<any>();

  const navigateTo = useCallback((screenName: string, params?: Record<string, unknown>, options?: NavigationOptions) => {
    if (options?.replace) {
      navigation.replace(screenName, params);
    } else if (options?.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: screenName, params }],
      });
    } else {
      navigation.navigate(screenName, params);
    }
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getParam = useCallback(<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined => {
    const params = route.params as T | undefined;
    return params?.[key] ?? defaultValue;
  }, [route.params]);

  return {
    navigateTo,
    goBack,
    getParam,
    currentRoute: route.name,
    params: route.params as T,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useParams<T extends Record<string, any> = Record<string, unknown>>(): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route = useRoute<any>();
  return (route.params as T) || {} as T;
}
