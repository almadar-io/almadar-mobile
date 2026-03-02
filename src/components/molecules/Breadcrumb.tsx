import React from 'react';
import { 
  TouchableOpacity,
  ScrollView,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { HStack } from '../atoms/Stack';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  action?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  style?: ViewStyle;
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  style,
  onNavigate,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = (item: BreadcrumbItem, index: number) => {
    if (item.action) {
      eventBus.emit(`UI:${item.action}`, { href: item.href, index });
    }
    onNavigate?.(item, index);
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
    >
      <HStack spacing={4} align="center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <HStack key={index} spacing={4} align="center">
              {index > 0 && (
                <Typography 
                  variant="caption" 
                  style={{ color: theme.colors['muted-foreground'] }}
                >
                  /
                </Typography>
              )}
              {isLast ? (
                <Typography 
                  variant="caption" 
                  style={{ color: theme.colors.foreground, fontWeight: '500' }}
                >
                  {item.label}
                </Typography>
              ) : (
                <TouchableOpacity onPress={() => handlePress(item, index)}>
                  <Typography 
                    variant="caption" 
                    style={{ color: theme.colors.primary }}
                  >
                    {item.label}
                  </Typography>
                </TouchableOpacity>
              )}
            </HStack>
          );
        })}
      </HStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
  },
});

Breadcrumb.displayName = 'Breadcrumb';
