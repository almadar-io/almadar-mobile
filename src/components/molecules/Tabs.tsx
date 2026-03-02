import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle,
  ScrollView 
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { HStack } from '../atoms/Stack';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  style?: ViewStyle;
  variant?: 'default' | 'pills' | 'underlined';
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  style,
  variant = 'default',
  isLoading,
  error,
  changeEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  const currentTab = activeTab ?? internalActiveTab;

  const handleTabPress = (tabId: string) => {
    setInternalActiveTab(tabId);
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { tabId });
    }
    onChange?.(tabId);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading..." />
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

  const getTabStyle = (isActive: boolean) => {
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
        };
      default:
        return {
          backgroundColor: isActive ? theme.colors.card : 'transparent',
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.sm,
        };
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HStack spacing={8}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                style={[
                  styles.tab,
                  getTabStyle(isActive),
                ]}
              >
                <HStack spacing={4} align="center">
                  {tab.icon}
                  <Typography 
                    variant="body" 
                    style={{ 
                      color: isActive && variant === 'pills' 
                        ? theme.colors['primary-foreground'] 
                        : theme.colors.foreground 
                    }}
                  >
                    {tab.label}
                  </Typography>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                      <Typography variant="caption" style={{ color: theme.colors['error-foreground'] }}>
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </Typography>
                    </View>
                  )}
                </HStack>
              </TouchableOpacity>
            );
          })}
        </HStack>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});

Tabs.displayName = 'Tabs';
