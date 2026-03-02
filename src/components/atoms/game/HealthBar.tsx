import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';

export interface HealthBarProps {
  /** Current health value */
  current: number;
  /** Maximum health value */
  max: number;
  /** Display format */
  format?: 'hearts' | 'bar' | 'numeric';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional styles */
  style?: ViewStyle;
  /** Animation on change */
  animated?: boolean;
}

const sizeMap = {
  sm: { heart: 16, bar: 8, text: 12 },
  md: { heart: 24, bar: 12, text: 16 },
  lg: { heart: 32, bar: 16, text: 20 },
};

const HeartIcon: React.FC<{ filled: boolean; size: number; color: string }> = ({ 
  filled, 
  size, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  color 
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontSize: size * 0.8,
        color: filled ? '#ef4444' : '#9ca3af',
      }}
    >
      {filled ? '♥' : '♡'}
    </Text>
  </View>
);

export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  format = 'hearts',
  size = 'md',
  style,
  animated = true,
}) => {
  const theme = useTheme();
  const sizes = sizeMap[size];
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  if (format === 'hearts') {
    return (
      <View style={[styles.heartsContainer, style]}>
        {Array.from({ length: max }).map((_, i) => (
          <View
            key={i}
            style={[
              animated && styles.animatedHeart,
            ]}
          >
            <HeartIcon
              filled={i < current}
              size={sizes.heart}
              color={theme.colors.error}
            />
          </View>
        ))}
      </View>
    );
  }

  if (format === 'bar') {
    const barColor = percentage > 66 
      ? '#22c55e' // green
      : percentage > 33 
        ? '#eab308' // yellow
        : '#ef4444'; // red

    return (
      <View
        style={[
          styles.barContainer,
          {
            height: sizes.bar,
            backgroundColor: theme.colors.muted,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
            animated && styles.animatedBar,
          ]}
        />
      </View>
    );
  }

  // Numeric format
  return (
    <Text
      style={[
        styles.numericText,
        {
          fontSize: sizes.text,
          color: theme.colors.foreground,
        },
        style as never,
      ]}
    >
      {current}/{max}
    </Text>
  );
};

const styles = StyleSheet.create({
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  animatedHeart: {
    // React Native transform animation could be added here
  },
  barContainer: {
    width: 96,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 9999,
  },
  animatedBar: {
    // LayoutAnimation could be configured
  },
  numericText: {
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});

HealthBar.displayName = 'HealthBar';
