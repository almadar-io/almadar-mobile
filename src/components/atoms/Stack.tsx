import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface VStackProps {
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  children: React.ReactNode;
  style?: ViewStyle;
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
  return (
    <View
      testID={testID}
      style={[
        styles.vstack,
        { gap: spacing, alignItems: align, justifyContent: justify },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface HStackProps {
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  children: React.ReactNode;
  style?: ViewStyle;
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
  return (
    <View
      testID={testID}
      style={[
        styles.hstack,
        { gap: spacing, alignItems: align, justifyContent: justify },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface BoxProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const Box: React.FC<BoxProps> = ({ children, style, testID }) => {
  return (
    <View testID={testID} style={style}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  vstack: {
    flexDirection: 'column',
  },
  hstack: {
    flexDirection: 'row',
  },
});

VStack.displayName = 'VStack';
HStack.displayName = 'HStack';
Box.displayName = 'Box';
