import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';

export interface VStackProps {
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | undefined;
  testID?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const VStack: React.FC<VStackProps> = ({
  spacing = 8,
  align = 'stretch',
  justify = 'flex-start',
  children,
  style,
  testID,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.vstack, style]}>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.vstack, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

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
  style?: ViewStyle | ViewStyle[] | undefined;
  testID?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const HStack: React.FC<HStackProps> = ({
  spacing = 8,
  align = 'center',
  justify = 'flex-start',
  children,
  style,
  testID,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.hstack, style]}>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.hstack, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

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
  style?: ViewStyle | ViewStyle[] | undefined;
  testID?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Box: React.FC<BoxProps> = ({ 
  children, 
  style, 
  testID,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.box, style]}>
        <LoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.box, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

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
