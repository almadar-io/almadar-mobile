import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  fillStyle?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  size = 'md',
  style,
  trackStyle,
  fillStyle,
  isLoading,
  error,
}) => {
  const theme = useTheme();

  const clampedProgress = Math.max(0, Math.min(100, progress));

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  const heightMap: Record<string, number> = {
    sm: 4,
    md: 8,
    lg: 12,
  };

  const height = heightMap[size];

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.colors.muted,
            borderRadius: height / 2,
          },
          trackStyle,
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              height: '100%',
              backgroundColor: theme.colors.primary,
              borderRadius: height / 2,
            },
            fillStyle,
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.foreground }]}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    // Animated fill
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
});

ProgressBar.displayName = 'ProgressBar';
