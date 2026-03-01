import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'caption' 
  | 'label';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const variantStyles: Record<TypographyVariant, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '500', lineHeight: 16, textTransform: 'uppercase' },
};

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  children,
  style,
  ...rest
}: TypographyProps) {
  return (
    <Text
      style={[
        variantStyles[variant],
        { textAlign: align },
        color ? { color } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

Typography.displayName = 'Typography';
