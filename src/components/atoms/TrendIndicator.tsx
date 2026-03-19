import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { HStack } from './Stack';

export type TrendDirection = 'up' | 'down' | 'neutral';
export type TrendSize = 'sm' | 'md' | 'lg';

export interface TrendIndicatorProps {
  value?: number;
  direction?: TrendDirection;
  showValue?: boolean;
  size?: TrendSize;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

const sizeConfig: Record<TrendSize, { icon: number; font: 'xs' | 'sm' | 'base' }> = {
  sm: { icon: 14, font: 'xs' },
  md: { icon: 18, font: 'sm' },
  lg: { icon: 22, font: 'base' },
};

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  direction = 'neutral',
  showValue = true,
  size = 'md',
  style,
}) => {
  const theme = useTheme();
  const config = sizeConfig[size];

  const directionColors: Record<TrendDirection, string> = {
    up: theme.colors.success,
    down: theme.colors.error,
    neutral: theme.colors['muted-foreground'],
  };

  const color = directionColors[direction];
  const iconName = direction === 'up' ? 'chevron-up' : direction === 'down' ? 'chevron-down' : 'minus';

  return (
    <HStack spacing={4} align="center" style={style}>
      <Icon name={iconName} size={config.icon} color={color} />
      {showValue && value !== undefined && (
        <Typography
          variant="body"
          style={[
            styles.value,
            { color, fontSize: theme.typography.sizes[config.font] },
          ]}
        >
          {Math.abs(value)}%
        </Typography>
      )}
    </HStack>
  );
};

const styles = StyleSheet.create({
  value: {
    fontWeight: '500',
  },
});

TrendIndicator.displayName = 'TrendIndicator';
