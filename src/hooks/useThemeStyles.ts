import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from '../providers/ThemeContext';

/**
 * Hook for creating theme-aware styles
 * 
 * @example
 * const styles = useThemeStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing[4],
 *   },
 *   text: {
 *     color: theme.colors.foreground,
 *     fontSize: theme.typography.sizes.base,
 *   },
 * }));
 */
export function useThemeStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(
  styleCreator: (theme: ReturnType<typeof useTheme>) => T
): T {
  const theme = useTheme();
  
  return useMemo(() => {
    const styles = styleCreator(theme);
    return StyleSheet.create(styles) as T;
  }, [theme, styleCreator]);
}

/**
 * Get a single theme value
 * 
 * @example
 * const bgColor = useThemeValue((t) => t.colors.background);
 */
export function useThemeValue<T>(selector: (theme: ReturnType<typeof useTheme>) => T): T {
  const theme = useTheme();
  return useMemo(() => selector(theme), [theme, selector]);
}
