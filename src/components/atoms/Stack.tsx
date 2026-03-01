import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface VStackProps {
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const VStack: React.FC<VStackProps> = ({
  spacing = 8,
  align = 'stretch',
  justify = 'flex-start',
  children,
  style,
  testID,
}) => {
  const stackStyles: ViewStyle[] = [
    styles.vstack,
    { gap: spacing, alignItems: align, justifyContent: justify },
  ];
  
  if (Array.isArray(style)) {
    stackStyles.push(...style);
  } else if (style) {
    stackStyles.push(style);
  }

  return (
    <View testID={testID} style={stackStyles}>
      {children}
    </View>
  );
};

export interface HStackProps {
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const HStack: React.FC<HStackProps> = ({
  spacing = 8,
  align = 'center',
  justify = 'flex-start',
  children,
  style,
  testID,
}) => {
  const stackStyles: ViewStyle[] = [
    styles.hstack,
    { gap: spacing, alignItems: align, justifyContent: justify },
  ];
  
  if (Array.isArray(style)) {
    stackStyles.push(...style);
  } else if (style) {
    stackStyles.push(style);
  }

  return (
    <View testID={testID} style={stackStyles}>
      {children}
    </View>
  );
};

export interface BoxProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const Box: React.FC<BoxProps> = ({ children, style, testID }) => {
  const boxStyles: ViewStyle[] = [styles.box];
  
  if (Array.isArray(style)) {
    boxStyles.push(...style);
  } else if (style) {
    boxStyles.push(style);
  }

  return <View testID={testID} style={boxStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  vstack: {
    flexDirection: 'column',
  },
  hstack: {
    flexDirection: 'row',
  },
  box: {
    // Base box styles - mostly empty to allow full customization
  },
});

VStack.displayName = 'VStack';
HStack.displayName = 'HStack';
Box.displayName = 'Box';
