import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { HealthBar } from '../../atoms/game/HealthBar';
import { ScoreDisplay } from '../../atoms/game/ScoreDisplay';

export interface StatBadgeProps {
  /** Stat label */
  label: string;
  /** Current value (defaults to 0 if not provided) */
  value?: number | string;
  /** Maximum value (for bar/hearts format) */
  max?: number;
  /** Data source entity name (for schema config) */
  source?: string;
  /** Field name in the source (for schema config) */
  field?: string;
  /** Display format */
  format?: 'number' | 'hearts' | 'bar' | 'text' | string;
  /** Icon component or emoji */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | string;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | string;
  /** Additional styles */
  style?: ViewStyle;
}

const sizeMap: Record<string, { padding: number; fontSize: number }> = {
  sm: { padding: 8, fontSize: 12 },
  md: { padding: 12, fontSize: 14 },
  lg: { padding: 16, fontSize: 16 },
};

const variantMap: Record<string, { backgroundColor: string; borderColor: string }> = {
  default: { backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#374151' },
  primary: { backgroundColor: 'rgba(30, 58, 138, 0.8)', borderColor: '#1d4ed8' },
  success: { backgroundColor: 'rgba(20, 83, 45, 0.8)', borderColor: '#15803d' },
  warning: { backgroundColor: 'rgba(113, 63, 18, 0.8)', borderColor: '#a16207' },
  danger: { backgroundColor: 'rgba(127, 29, 29, 0.8)', borderColor: '#b91c1c' },
};

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value = 0,
  max,
  format = 'number',
  icon,
  size = 'md',
  variant = 'default',
  style,
  // Ignored config props (used for schema binding)
  source: _source,
  field: _field,
}) => {
  const theme = useTheme();
  const numValue = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
  const sizeStyles = sizeMap[size] ?? sizeMap.md;
  const variantStyles = variantMap[variant] ?? variantMap.default;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          padding: sizeStyles.padding,
        },
        style as never,
      ]}
    >
      {icon && (
        <Text style={{ fontSize: 18, marginRight: 8 }}>
          {icon as string}
        </Text>
      )}
      
      <Text
        style={{
          fontSize: sizeStyles.fontSize,
          color: theme.colors['muted-foreground'],
          fontWeight: '500',
          marginRight: 8,
        }}
      >
        {label}
      </Text>
      
      {format === 'hearts' && max && (
        <HealthBar
          current={numValue}
          max={max}
          format="hearts"
          size={size === 'lg' ? 'md' : 'sm'}
        />
      )}
      
      {format === 'bar' && max && (
        <HealthBar
          current={numValue}
          max={max}
          format="bar"
          size={size === 'lg' ? 'md' : 'sm'}
        />
      )}
      
      {format === 'number' && (
        <ScoreDisplay
          value={numValue}
          size={size === 'lg' ? 'md' : 'sm'}
          animated
        />
      )}
      
      {format === 'text' && (
        <Text
          style={{
            fontSize: sizeStyles.fontSize,
            color: theme.colors['primary-foreground'],
            fontWeight: '700',
          }}
        >
          {value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
});

StatBadge.displayName = 'StatBadge';
