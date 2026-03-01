import { useCallback } from 'react';
import { useNavigation as useRNNavigation, useRoute } from '@react-navigation/native';

export interface NavigationOptions {
  replace?: boolean;
  reset?: boolean;
}

export function useNavigation() {
  const navigation = useRNNavigation();
  const route = useRoute();

  const navigateTo = useCallback((screenName: string, params?: Record<string, unknown>, options?: NavigationOptions) => {
    if (options?.replace) {
      navigation.replace(screenName, params);
    } else if (options?.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: screenName, params }],
      });
    } else {
      navigation.navigate(screenName as never, params as never);
    }
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getParam = useCallback(<T,>(key: string, defaultValue?: T): T | undefined => {
    const params = route.params as Record<string, unknown> | undefined;
    return params?.[key] ?? defaultValue;
  }, [route.params]);

  return {
    navigateTo,
    goBack,
    getParam,
    currentRoute: route.name,
    params: route.params,
  };
}

export function useParams<T extends Record<string, unknown>>(): T {
  const route = useRoute();
  return (route.params as T) || {} as T;
}
