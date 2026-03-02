import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';

import { Badge } from '../atoms/Badge';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  uri: string;
  thumbnailUri?: string;
  type: MediaType;
  title?: string;
  caption?: string;
}

export interface MediaGalleryProps {
  entity: MediaItem[];
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Number of columns in the grid */
  columns?: 2 | 3 | 4;
  /** Gap between items */
  gap?: number;
  /** Aspect ratio of items (width / height) */
  aspectRatio?: number;
  /** Maximum height of the gallery container */
  maxHeight?: number;
  /** Event emitted when an item is selected */
  selectEvent?: string;
  /** Event emitted when an item is long-pressed */
  contextEvent?: string;
  /** Payload to include with events */
  actionPayload?: Record<string, unknown>;
}

const { width: screenWidth } = Dimensions.get('window');

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  entity,
  style,
  isLoading,
  error,
  columns = 3,
  gap = 8,
  aspectRatio = 1,
  maxHeight,
  selectEvent,
  contextEvent,
  actionPayload,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading media..." />
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

  if (entity.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No media available" icon={<Typography variant="h2">🖼️</Typography>} />
      </View>
    );
  }

  const itemWidth = (screenWidth - 32 - gap * (columns - 1)) / columns;
  const itemHeight = itemWidth / aspectRatio;

  const handleItemPress = (item: MediaItem, index: number) => {
    if (selectEvent) {
      eventBus.emit(`UI:${selectEvent}`, { ...actionPayload, item, index });
    }
    setSelectedIndex(index);
  };

  const handleItemLongPress = (item: MediaItem, index: number) => {
    if (contextEvent) {
      eventBus.emit(`UI:${contextEvent}`, { ...actionPayload, item, index });
    }
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  const renderItem = (item: MediaItem, index: number): React.ReactNode => {
    const isVideo = item.type === 'video';

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleItemPress(item, index)}
        onLongPress={() => handleItemLongPress(item, index)}
        delayLongPress={500}
        activeOpacity={0.8}
        style={[
          styles.item,
          {
            width: itemWidth,
            height: itemHeight,
            marginBottom: gap,
          },
        ]}
      >
        <Image
          source={{ uri: item.thumbnailUri || item.uri }}
          style={styles.image}
          resizeMode="cover"
        />
        {isVideo && (
          <View style={styles.videoOverlay}>
            <Typography variant="h4" style={{ color: '#ffffff' }}>
              ▶
            </Typography>
          </View>
        )}
        {item.title && (
          <View style={styles.titleOverlay}>
            <Typography
              variant="caption"
              style={{ color: '#ffffff' }}
              numberOfLines={1}
            >
              {item.title}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGrid = (): React.ReactNode => {
    const rows: MediaItem[][] = [];
    for (let i = 0; i < entity.length; i += columns) {
      rows.push(entity.slice(i, i + columns));
    }

    return (
      <VStack spacing={0}>
        {rows.map((row, rowIndex) => (
          <HStack key={rowIndex} spacing={gap} justify="flex-start">
            {row.map((item, colIndex) => renderItem(item, rowIndex * columns + colIndex))}
          </HStack>
        ))}
      </VStack>
    );
  };

  const selectedItem = selectedIndex !== null ? entity[selectedIndex] : null;

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {renderGrid()}
      </ScrollView>

      {/* Full-screen viewer modal */}
      <Modal
        visible={selectedIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <Typography variant="h4" style={{ color: '#ffffff' }}>
              ✕
            </Typography>
          </TouchableOpacity>

          {selectedItem && (
            <VStack align="center" spacing={16} style={styles.modalContent}>
              <Image
                source={{ uri: selectedItem.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              {selectedItem.title && (
                <Typography variant="h4" style={{ color: '#ffffff' }}>
                  {selectedItem.title}
                </Typography>
              )}
              {selectedItem.caption && (
                <Typography variant="body" style={{ color: '#cccccc' }}>
                  {selectedItem.caption}
                </Typography>
              )}
              <Badge variant="secondary">
                {selectedItem.type === 'video' ? '🎥 Video' : '📷 Image'}
              </Badge>
            </VStack>
          )}

          {/* Navigation arrows */}
          {selectedIndex !== null && selectedIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={() => setSelectedIndex(selectedIndex - 1)}
            >
              <Typography variant="h3" style={{ color: '#ffffff' }}>
                ◀
              </Typography>
            </TouchableOpacity>
          )}
          {selectedIndex !== null && selectedIndex < entity.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={() => setSelectedIndex(selectedIndex + 1)}
            >
              <Typography variant="h3" style={{ color: '#ffffff' }}>
                ▶
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 12,
  },
  modalContent: {
    width: '100%',
    padding: 20,
  },
  fullImage: {
    width: '100%',
    height: 300,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    padding: 16,
    marginTop: -24,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
});

MediaGallery.displayName = 'MediaGallery';
