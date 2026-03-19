import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  style,
  textStyle,
}) => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayRef = useRef(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    animatedValue.setValue(displayRef.current);

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: v }) => {
      const rounded = Math.round(v);
      if (rounded !== displayRef.current) {
        displayRef.current = rounded;
        setDisplayValue(rounded);
      }
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue]);

  return (
    <Animated.View style={[styles.container, style]}>
      <Animated.Text
        style={[
          styles.text,
          {
            color: theme.colors.foreground,
            fontSize: theme.typography.sizes['2xl'],
            fontWeight: theme.typography.fontWeight.bold as '600',
          },
          textStyle,
        ]}
      >
        {prefix}{displayValue}{suffix}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

AnimatedCounter.displayName = 'AnimatedCounter';
