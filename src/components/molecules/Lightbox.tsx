import React, { useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  StyleSheet,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

export interface LightboxImage {
  uri: string;
  alt?: string;
}

export interface LightboxProps {
  images: LightboxImage[];
  currentIndex?: number;
  isOpen: boolean;
  closeAction?: string;
  onClose?: () => void;
  style?: ViewStyle;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex = 0,
  isOpen,
  closeAction,
  onClose,
  style,
}) => {
  const eventBus = useEventBus();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const handleClose = () => {
    if (closeAction) {
      eventBus.emit(`UI:${closeAction}`, {});
    }
    onClose?.();
  };

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / screenWidth);
      setActiveIndex(index);
    },
    [screenWidth]
  );

  React.useEffect(() => {
    if (isOpen && flatListRef.current && currentIndex >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
        setActiveIndex(currentIndex);
      }, 100);
    }
  }, [isOpen, currentIndex]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.95)' }, style]}>
        <View style={styles.header}>
          <Typography variant="body" style={{ color: '#fff' }}>
            {activeIndex + 1} / {images.length}
          </Typography>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Icon name="x" size={28} color="#fff" />
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => String(index)}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={[styles.imageContainer, { width: screenWidth, height: screenHeight * 0.75 }]}>
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode="contain"
              />
              {item.alt && (
                <Typography variant="caption" style={styles.caption}>
                  {item.alt}
                </Typography>
              )}
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  closeButton: {
    padding: 8,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 12,
  },
});

Lightbox.displayName = 'Lightbox';
