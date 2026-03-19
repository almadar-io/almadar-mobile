import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useThemeMode } from '../../providers/ThemeProvider';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { HStack } from './Stack';

export type ThemeToggleSize = 'sm' | 'md' | 'lg';

export interface ThemeToggleProps {
  size?: ThemeToggleSize;
  showLabel?: boolean;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

const sizeConfig: Record<ThemeToggleSize, { icon: number; padding: number }> = {
  sm: { icon: 18, padding: 6 },
  md: { icon: 24, padding: 10 },
  lg: { icon: 30, padding: 14 },
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  showLabel = false,
  style,
}) => {
  const theme = useTheme();
  const { resolvedMode, toggleMode } = useThemeMode();
  const config = sizeConfig[size];

  const isDark = resolvedMode === 'dark';
  const iconText = isDark ? '☀' : '☾';
  const label = isDark ? 'Light mode' : 'Dark mode';

  return (
    <Pressable
      onPress={toggleMode}
      style={[
        styles.container,
        {
          padding: config.padding,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.secondary,
        },
        style,
      ]}
    >
      <HStack spacing={theme.spacing[2]} align="center">
        <Icon name={isDark ? 'check' : 'settings'} size={config.icon} color={theme.colors.foreground} />
        <Typography variant="body" style={{ color: theme.colors.foreground, fontSize: config.icon * 0.7 }}>
          {iconText}
        </Typography>
        {showLabel && (
          <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
            {label}
          </Typography>
        )}
      </HStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});

ThemeToggle.displayName = 'ThemeToggle';
