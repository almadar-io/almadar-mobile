import React, { useState, useCallback } from 'react';
import { Pressable, LayoutAnimation, StyleSheet, ViewStyle, View } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { VStack, HStack } from '../atoms/Stack';
import { Divider } from '../atoms/Divider';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpenItems?: string[];
  toggleEvent?: string;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  defaultOpenItems = [],
  toggleEvent,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpenItems));

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error) return <ErrorState message={error.message} />;

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
    if (toggleEvent) {
      eventBus.emit(`UI:${toggleEvent}`, { itemId: id });
    }
  }, [multiple, toggleEvent, eventBus]);

  return (
    <VStack spacing={0} style={[styles.container, { borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.borderRadius.lg }, style as ViewStyle]}>
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        const isLast = index === items.length - 1;

        return (
          <View key={item.id}>
            <Pressable
              onPress={() => !item.disabled && handleToggle(item.id)}
              disabled={item.disabled}
              style={[
                styles.header,
                {
                  backgroundColor: theme.colors.card,
                  padding: theme.spacing[4],
                },
                item.disabled && { opacity: 0.5 },
                index === 0 && { borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg },
                isLast && !isOpen && { borderBottomLeftRadius: theme.borderRadius.lg, borderBottomRightRadius: theme.borderRadius.lg },
              ]}
            >
              <HStack spacing={theme.spacing[2]} align="center" style={styles.headerRow}>
                <Typography variant="body" style={{ color: theme.colors.foreground, fontWeight: '500', flex: 1 }}>
                  {item.title}
                </Typography>
                <Icon
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors['muted-foreground']}
                />
              </HStack>
            </Pressable>
            {isOpen && (
              <View
                style={[
                  styles.content,
                  {
                    backgroundColor: theme.colors.card,
                    padding: theme.spacing[4],
                    paddingTop: 0,
                  },
                  isLast && { borderBottomLeftRadius: theme.borderRadius.lg, borderBottomRightRadius: theme.borderRadius.lg },
                ]}
              >
                {item.content}
              </View>
            )}
            {!isLast && <Divider />}
          </View>
        );
      })}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {},
  headerRow: {
    justifyContent: 'space-between',
  },
  content: {},
});

Accordion.displayName = 'Accordion';
