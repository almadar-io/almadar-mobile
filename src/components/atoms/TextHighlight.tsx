import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from './Typography';

export type HighlightType = 'mark' | 'code' | 'emphasis' | 'custom';

export interface TextHighlightProps {
  children: React.ReactNode;
  highlightType?: HighlightType;
  isActive?: boolean;
  action?: string;
  actionPayload?: Record<string, unknown>;
  color?: string;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const TextHighlight: React.FC<TextHighlightProps> = ({
  children,
  highlightType = 'mark',
  isActive = true,
  action,
  actionPayload,
  color,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = () => {
    if (action) {
      eventBus.emit(`UI:${action}`, actionPayload);
    }
  };

  const highlightColors: Record<HighlightType, { bg: string; fg: string }> = {
    mark: { bg: theme.colors.warning + '40', fg: theme.colors.foreground },
    code: { bg: theme.colors.muted, fg: theme.colors.foreground },
    emphasis: { bg: theme.colors.primary + '20', fg: theme.colors.primary },
    custom: { bg: (color || theme.colors.accent) + '30', fg: theme.colors.foreground },
  };

  const { bg, fg } = highlightColors[highlightType];

  const content = (
    <Typography
      variant="body"
      style={[
        styles.text,
        isActive && {
          backgroundColor: bg,
          color: fg,
        },
        highlightType === 'code' && {
          fontFamily: 'monospace',
          fontSize: theme.typography.sizes.sm,
        },
        style,
      ]}
    >
      {children}
    </Typography>
  );

  if (action) {
    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  text: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pressable: {
    alignSelf: 'flex-start',
  },
});

TextHighlight.displayName = 'TextHighlight';
