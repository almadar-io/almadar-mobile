import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { VStack, HStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Divider } from '../atoms/Divider';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface MasterItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface MasterDetailProps {
  /** Master list items */
  items: MasterItem[];
  /** Selected item ID */
  selectedId?: string | null;
  /** Callback when an item is selected */
  onSelect?: (item: MasterItem) => void;
  /** Detail content renderer */
  renderDetail: (item: MasterItem | null) => React.ReactNode;
  /** Master list title */
  masterTitle?: string;
  /** Custom master item renderer */
  renderMasterItem?: (item: MasterItem, isSelected: boolean) => React.ReactNode;
  /** Key extractor for items */
  keyExtractor?: (item: MasterItem) => string;
  /** Container style */
  style?: ViewStyle;
  /** Master pane width (only used on tablets/desktop) */
  masterWidth?: number;
  /** Whether to show as split on mobile */
  splitOnMobile?: boolean;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event to emit on item select */
  selectEvent?: string;
}

export const MasterDetail: React.FC<MasterDetailProps> = ({
  items,
  selectedId,
  onSelect,
  renderDetail,
  masterTitle,
  renderMasterItem,
  keyExtractor = (item) => item.id,
  style,
  masterWidth = 280,
  splitOnMobile = false,
  isLoading,
  error,
  entity,
  selectEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedId || null
  );
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);

  const currentSelectedId = selectedId !== undefined ? selectedId : internalSelectedId;
  const selectedItem = items.find((item) => keyExtractor(item) === currentSelectedId) || null;

  const isTabletOrLarger = SCREEN_WIDTH >= 768;
  const shouldShowSplit = isTabletOrLarger || splitOnMobile;

  const handleSelect = useCallback(
    (item: MasterItem) => {
      if (selectEvent) {
        eventBus.emit(`UI:${selectEvent}`, { item, entity });
      }
      onSelect?.(item);
      if (selectedId === undefined) {
        setInternalSelectedId(keyExtractor(item));
      }
      if (!shouldShowSplit) {
        setShowDetailOnMobile(true);
      }
    },
    [onSelect, selectEvent, entity, keyExtractor, selectedId, shouldShowSplit, eventBus]
  );

  const handleBack = useCallback(() => {
    setShowDetailOnMobile(false);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message={`Loading ${entity || 'items'}...`} />
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

  if (items.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message={`No ${entity || 'items'} available`} />
      </View>
    );
  }

  const defaultRenderMasterItem = (item: MasterItem, isSelected: boolean) => {
    const cardStyle: ViewStyle[] = [styles.masterItem];
    if (isSelected) {
      cardStyle.push({ backgroundColor: theme.colors.primary + '15' });
    }

    return (
      <Card
        onPress={() => handleSelect(item)}
        padding="md"
        style={cardStyle}
      >
        <VStack spacing={4}>
          <Typography variant="body" style={isSelected ? { color: theme.colors.primary } : undefined}>
            {item.title}
          </Typography>
          {item.subtitle && (
            <Typography variant="caption">{item.subtitle}</Typography>
          )}
        </VStack>
      </Card>
    );
  };

  const renderMasterContent = () => (
    <VStack style={styles.masterPane}>
      {masterTitle && (
        <>
          <Typography variant="h4" style={styles.masterTitle}>
            {masterTitle}
          </Typography>
          <Divider />
        </>
      )}
      <ScrollView style={styles.masterList} showsVerticalScrollIndicator={false}>
        <VStack spacing={8} style={styles.masterListContent}>
          {items.map((item) => {
            const itemKey = keyExtractor(item);
            const isSelected = currentSelectedId === itemKey;
            return (
              <View key={itemKey}>
                {renderMasterItem
                  ? renderMasterItem(item, isSelected)
                  : defaultRenderMasterItem(item, isSelected)}
              </View>
            );
          })}
        </VStack>
      </ScrollView>
    </VStack>
  );

  const renderDetailContent = () => (
    <View style={styles.detailPane}>
      {!shouldShowSplit && showDetailOnMobile && (
        <HStack style={styles.mobileBackHeader}>
          <Button variant="ghost" onPress={handleBack} size="sm">
            ← Back
          </Button>
        </HStack>
      )}
      <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
        {renderDetail(selectedItem)}
      </ScrollView>
    </View>
  );

  // Mobile view: show either master or detail
  if (!shouldShowSplit) {
    return (
      <View style={[styles.container, style]}>
        {showDetailOnMobile ? renderDetailContent() : renderMasterContent()}
      </View>
    );
  }

  // Split view: show both panes
  return (
    <HStack style={style}>
      <View style={[styles.masterPane, { width: masterWidth }]}>{renderMasterContent()}</View>
      <Divider orientation="vertical" />
      <View style={styles.detailPane}>{renderDetailContent()}</View>
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  masterPane: {
    flex: 1,
  },
  masterTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  masterList: {
    flex: 1,
  },
  masterListContent: {
    padding: 12,
  },
  masterItem: {
    marginBottom: 4,
  },
  detailPane: {
    flex: 1,
  },
  mobileBackHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  detailScroll: {
    flex: 1,
  },
});

MasterDetail.displayName = 'MasterDetail';
