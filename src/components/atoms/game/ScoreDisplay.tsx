import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';

export interface ScoreDisplayProps {
  /** Current score value */
  value: number;
  /** Label to display before score */
  label?: string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional styles */
  style?: ViewStyle;
  /** Animation on value change */
  animated?: boolean;
  /** Number formatting locale */
  locale?: string;
}

const sizeMap: Record<string, { fontSize: number }> = {
  sm: { fontSize: 14 },
  md: { fontSize: 18 },
  lg: { fontSize: 24 },
  xl: { fontSize: 36 },
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  value,
  label,
  icon,
  size = 'md',
  style,
  animated = true,
  locale = 'en-US',
}) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeConfig = sizeMap[size] ?? sizeMap.md;

  useEffect(() => {
    if (!animated || displayValue === value) {
      setDisplayValue(value);
      return;
    }

    setIsAnimating(true);
    const diff = value - displayValue;
    const steps = Math.min(Math.abs(diff), 20);
    const increment = diff / steps;
    let current = displayValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [value, animated]);

  const formattedValue = new Intl.NumberFormat(locale).format(displayValue);

  return (
    <View
      style={[
        styles.container,
        {
          opacity: isAnimating ? 0.7 : 1,
        },
        style as never,
      ]}
    >
      {icon && (
        <Text style={{ fontSize: sizeConfig.fontSize, marginRight: 8 }}>
          {icon as string}
        </Text>
      )}
      {label && (
        <Text
          style={{
            fontSize: sizeConfig.fontSize,
            color: theme.colors['muted-foreground'],
            marginRight: 8,
          }}
        >
          {label}
        </Text>
      )}
      <Text
        style={{
          fontSize: sizeConfig.fontSize,
          color: theme.colors.foreground,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {formattedValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

ScoreDisplay.displayName = 'ScoreDisplay';
