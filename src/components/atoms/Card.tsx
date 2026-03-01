import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles: Record<string, ViewStyle> = {
  none: { padding: 0 },
  sm: { padding: 12 },
  md: { padding: 16 },
  lg: { padding: 24 },
};

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
}) => {
  const cardStyles: ViewStyle[] = [
    styles.card,
    paddingStyles[padding],
  ];
  
  if (Array.isArray(style)) {
    cardStyles.push(...style);
  } else if (style) {
    cardStyles.push(style);
  }

  const content = (
    <View style={cardStyles}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

Card.displayName = 'Card';
