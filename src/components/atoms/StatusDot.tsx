import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from './Typography';
import { HStack } from './Stack';

export type StatusDotStatus = 'online' | 'offline' | 'busy' | 'away' | 'error';
export type StatusDotSize = 'sm' | 'md' | 'lg';

export interface StatusDotProps {
  status?: StatusDotStatus;
  pulse?: boolean;
  size?: StatusDotSize;
  label?: string;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

const sizeMap: Record<StatusDotSize, number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'offline',
  pulse = false,
  size = 'md',
  label,
  style,
}) => {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const statusColors: Record<StatusDotStatus, string> = {
    online: theme.colors.success,
    offline: theme.colors['muted-foreground'],
    busy: theme.colors.error,
    away: theme.colors.warning,
    error: theme.colors.error,
  };

  useEffect(() => {
    if (pulse && (status === 'online' || status === 'busy')) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pulse, status, pulseAnim]);

  const dotSize = sizeMap[size];
  const color = statusColors[status];

  const dot = (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            opacity: pulseAnim,
          },
        ]}
      />
    </View>
  );

  if (label) {
    return (
      <HStack spacing={theme.spacing[2]} align="center" style={style}>
        {dot}
        <Typography variant="caption" style={{ color: theme.colors.foreground }}>
          {label}
        </Typography>
      </HStack>
    );
  }

  return dot;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
});

StatusDot.displayName = 'StatusDot';
