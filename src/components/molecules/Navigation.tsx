import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface NavigationItem {
  /**
   * Item ID
   */
  id: string;

  /**
   * Item label
   */
  label: string;

  /**
   * Item icon (emoji or text)
   */
  icon?: string;

  /**
   * Item badge count
   */
  badge?: number;

  /**
   * Is item active
   */
  isActive?: boolean;

  /**
   * Disable item
   */
  disabled?: boolean;

  /**
   * Item click handler
   */
  onPress?: () => void;

  /**
   * Declarative event name - emits UI:{event} via eventBus on press
   */
  event?: string;

  /**
   * Navigation target for declarative navigation
   */
  navigatesTo?: string;
}

export interface NavigationProps {
  /**
   * Navigation items
   */
  items: NavigationItem[];

  /**
   * Navigation orientation
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Additional style for the container
   */
  style?: ViewStyle;

  /**
   * Variant for styling
   * @default 'default'
   */
  variant?: 'default' | 'pills' | 'underlined';

  /** Loading state indicator */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Entity name for schema-driven auto-fetch */
  entity?: string;

  /**
   * Declarative change event name - emits UI:{changeEvent} via eventBus when navigation changes
   */
  changeEvent?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  orientation = 'horizontal',
  style,
  variant = 'default',
  isLoading,
  error,
  changeEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = (item: NavigationItem) => {
    if (item.disabled) return;

    if (item.event) {
      eventBus.emit(`UI:${item.event}`, { itemId: item.id, navigatesTo: item.navigatesTo });
    }

    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { itemId: item.id, navigatesTo: item.navigatesTo });
    }

    item.onPress?.();
  };

  const getItemStyle = (isActive: boolean): ViewStyle => {
    switch (variant) {
      case 'pills':
        return {
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          borderRadius: theme.borderRadius.full,
        };
      case 'underlined':
        return {
          borderBottomWidth: 2,
          borderBottomColor: isActive ? theme.colors.primary : 'transparent',
          backgroundColor: 'transparent',
          borderRadius: 0,
        };
      default:
        return {
          backgroundColor: isActive ? theme.colors.card : 'transparent',
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const getTextColor = (isActive: boolean): string => {
    if (variant === 'pills' && isActive) {
      return theme.colors['primary-foreground'];
    }
    return isActive ? theme.colors.primary : theme.colors.foreground;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading navigation..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  const renderItem = (item: NavigationItem) => {
    const isActive = item.isActive ?? false;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handlePress(item)}
        disabled={item.disabled}
        style={[
          styles.item,
          getItemStyle(isActive),
          item.disabled && { opacity: 0.5 },
        ]}
        activeOpacity={0.7}
      >
        <HStack spacing={8} align="center">
          {item.icon && (
            <Typography variant="body" style={{ color: getTextColor(isActive) }}>
              {item.icon}
            </Typography>
          )}
          <Typography variant="body" style={{ color: getTextColor(isActive) }}>
            {item.label}
          </Typography>
          {item.badge !== undefined && item.badge > 0 && (
            <Badge variant="error" size="sm">
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </HStack>
      </TouchableOpacity>
    );
  };

  if (orientation === 'horizontal') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.horizontalContainer, style]}
      >
        {items.map(renderItem)}
      </ScrollView>
    );
  }

  return (
    <VStack spacing={4} style={[styles.verticalContainer, ...(style ? [style] : [])]}>
      {items.map(renderItem)}
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  horizontalContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  verticalContainer: {
    width: '100%',
    padding: 8,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
});

Navigation.displayName = 'Navigation';
