import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

// For now, using a simple text-based icon approach
// In production, this would use react-native-vector-icons
export type IconName = 
  | 'home' 
  | 'user' 
  | 'settings' 
  | 'arrow-right' 
  | 'arrow-left'
  | 'check'
  | 'x'
  | 'plus'
  | 'minus'
  | 'search'
  | 'menu'
  | 'more-vertical'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Simple emoji/icon mapping for initial implementation
const iconMap: Record<IconName, string> = {
  home: '🏠',
  user: '👤',
  settings: '⚙️',
  'arrow-right': '→',
  'arrow-left': '←',
  check: '✓',
  x: '✕',
  plus: '+',
  minus: '−',
  search: '🔍',
  menu: '☰',
  'more-vertical': '⋮',
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-down': '⌄',
  'chevron-up': '⌃',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#374151',
  style,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text style={[
        styles.icon,
        { fontSize: size * 0.7, color, lineHeight: size },
      ]}>
        {iconMap[name] || '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

Icon.displayName = 'Icon';
