import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';

import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { VStack } from '../../atoms/Stack';
import { Tabs, Tab } from '../../molecules/Tabs';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';
import { EmptyState } from '../../molecules/EmptyState';

export interface TabbedContainerTab extends Tab {
  content: React.ReactNode;
  badge?: number;
}

export interface TabbedContainerProps {
  tabs: TabbedContainerTab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle | undefined;
  variant?: 'default' | 'pills' | 'underlined';
  showCards?: boolean;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event name emitted when tab changes */
  changeEvent?: string;
}

export const TabbedContainer: React.FC<TabbedContainerProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  style,
  contentStyle,
  variant = 'default',
  showCards = true,
  isLoading,
  error,
  entity,
  changeEvent,
}) => {
  const eventBus = useEventBus();
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  const currentTabId = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = useCallback((tabId: string) => {
    setInternalActiveTab(tabId);
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, {
        tabId,
        entity,
        previousTab: currentTabId,
      });
    }
    onChange?.(tabId);
  }, [changeEvent, currentTabId, entity, eventBus, onChange]);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading tabs..." />
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

  if (!tabs || tabs.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No tabs available" />
      </View>
    );
  }

  const activeTabData = tabs.find((tab) => tab.id === currentTabId);
  const displayTabs: Tab[] = tabs.map(({ id, label, icon, badge }) => ({
    id,
    label,
    icon,
    badge,
  }));

  const ContentWrapper = showCards ? Card : View;
  const contentWrapperProps: { style: ViewStyle } = showCards
    ? { style: styles.cardContent }
    : { style: styles.plainContent };

  return (
    <VStack style={style ? [styles.container, style] : styles.container} spacing={0}>
      <Tabs
        tabs={displayTabs}
        activeTab={currentTabId}
        onChange={handleTabChange}
        variant={variant}
      />
      <ContentWrapper {...contentWrapperProps}>
        <ScrollView style={styles.scrollView} contentContainerStyle={contentStyle || styles.emptyContent}>
          {activeTabData?.content || (
            <EmptyState message="No content available" />
          )}
        </ScrollView>
      </ContentWrapper>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    marginTop: 8,
  },
  plainContent: {
    flex: 1,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyContent: {},
});

TabbedContainer.displayName = 'TabbedContainer';
