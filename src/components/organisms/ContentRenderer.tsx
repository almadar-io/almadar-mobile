import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Image,
  ScrollView,
  Linking,
} from 'react-native';

import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { VStack, HStack } from '../atoms/Stack';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export type ContentType =
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'video'
  | 'link'
  | 'button'
  | 'list'
  | 'quote'
  | 'code'
  | 'divider'
  | 'card'
  | 'custom';

export interface ContentItem {
  id: string;
  type: ContentType;
  content?: string;
  src?: string;
  href?: string;
  title?: string;
  alt?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  items?: ContentItem[];
  metadata?: Record<string, unknown>;
  style?: ViewStyle;
}

export interface ContentRendererProps {
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Content items to render */
  items?: ContentItem[];
  /** Gap between content items */
  gap?: number;
  /** Whether to render in a scroll view */
  scrollable?: boolean;
  /** Custom renderer for specific content types */
  customRenderers?: Partial<Record<ContentType, (item: ContentItem) => React.ReactNode>>;
  /** Event prefix for content interactions */
  eventPrefix?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  style,
  isLoading,
  error,
  entity,
  items = [],
  gap = 16,
  scrollable = false,
  customRenderers = {},
  eventPrefix = 'CONTENT',
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleLinkPress = useCallback((href: string, itemId: string) => {
    // Try to open the link
    Linking.canOpenURL(href).then((supported) => {
      if (supported) {
        Linking.openURL(href);
      }
    });

    eventBus.emit(`UI:${eventPrefix}_LINK_CLICK`, {
      entity,
      itemId,
      href,
    });
  }, [entity, eventPrefix, eventBus]);

  const handleButtonPress = useCallback((item: ContentItem) => {
    eventBus.emit(`UI:${eventPrefix}_BUTTON_CLICK`, {
      entity,
      itemId: item.id,
      action: item.href,
      metadata: item.metadata,
    });

    if (item.href) {
      handleLinkPress(item.href, item.id);
    }
  }, [entity, eventPrefix, handleLinkPress, eventBus]);

  const renderText = (item: ContentItem): React.ReactNode => {
    const variant = item.type === 'heading' 
      ? (item.metadata?.level as 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label') || 'h3'
      : 'body';

    return (
      <Typography
        key={item.id}
        variant={variant}
        style={item.style}
        color={item.metadata?.color as string}
      >
        {item.content}
      </Typography>
    );
  };

  const renderParagraph = (item: ContentItem): React.ReactNode => {
    return (
      <Typography
        key={item.id}
        variant="body"
        style={[{ lineHeight: theme.typography.lineHeight * theme.typography.sizes.base * 1.5 }, item.style]}
        color={theme.colors['muted-foreground']}
      >
        {item.content}
      </Typography>
    );
  };

  const renderImage = (item: ContentItem): React.ReactNode => {
    return (
      <View key={item.id} style={[styles.imageContainer, item.style]}>
        {item.src ? (
          <Image
            source={{ uri: item.src }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={item.alt}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              {item.alt || 'Image'}
            </Typography>
          </View>
        )}
        {item.title && (
          <Typography variant="caption" style={styles.imageCaption}>
            {item.title}
          </Typography>
        )}
      </View>
    );
  };

  const renderLink = (item: ContentItem): React.ReactNode => {
    return (
      <Typography
        key={item.id}
        variant="body"
        color={theme.colors.primary}
        style={[{ textDecorationLine: 'underline' }, item.style]}
        onPress={() => item.href && handleLinkPress(item.href, item.id)}
      >
        {item.content || item.title || item.href}
      </Typography>
    );
  };

  const renderButton = (item: ContentItem): React.ReactNode => {
    return (
      <Button
        key={item.id}
        variant={item.variant || 'default'}
        onPress={() => handleButtonPress(item)}
        action={`${eventPrefix}_BUTTON_CLICK`}
        actionPayload={{
          entity,
          itemId: item.id,
          action: item.href,
          metadata: item.metadata,
        }}
      >
        {item.content || item.title || 'Button'}
      </Button>
    );
  };

  const renderList = (item: ContentItem): React.ReactNode => {
    const listItems = item.items || [];
    const isOrdered = item.metadata?.ordered === true;

    return (
      <VStack key={item.id} spacing={8} style={item.style}>
        {listItems.map((listItem, index) => (
          <HStack key={listItem.id} spacing={8} align="flex-start">
            <Typography variant="body" color={theme.colors.foreground}>
              {isOrdered ? `${index + 1}.` : '•'}
            </Typography>
            <View style={{ flex: 1 }}>
              {renderContentItem(listItem)}
            </View>
          </HStack>
        ))}
      </VStack>
    );
  };

  const renderQuote = (item: ContentItem): React.ReactNode => {
    return (
      <View
        key={item.id}
        style={[
          styles.quote,
          {
            borderLeftColor: theme.colors.primary,
            backgroundColor: theme.colors.muted,
          },
          item.style,
        ]}
      >
        <Typography variant="body" style={{ fontStyle: 'italic' }}>
          "{item.content}"
        </Typography>
        {item.title && (
          <Typography variant="caption" color={theme.colors['muted-foreground']} style={{ marginTop: 8 }}>
            — {item.title}
          </Typography>
        )}
      </View>
    );
  };

  const renderCode = (item: ContentItem): React.ReactNode => {
    return (
      <View
        key={item.id}
        style={[
          styles.code,
          {
            backgroundColor: theme.colors.muted,
          },
          item.style,
        ]}
      >
        <Typography
          variant="caption"
          style={{ fontFamily: 'monospace' }}
          color={theme.colors.foreground}
        >
          {item.content}
        </Typography>
      </View>
    );
  };

  const renderDivider = (item: ContentItem): React.ReactNode => {
    return (
      <View
        key={item.id}
        style={[
          styles.divider,
          { backgroundColor: theme.colors.border },
          item.style,
        ]}
      />
    );
  };

  const renderCard = (item: ContentItem): React.ReactNode => {
    const cardItems = item.items || [];

    return (
      <Card
        key={item.id}
        style={item.style || undefined}
        padding="md"
      >
        {item.title && (
          <Typography variant="h4" style={{ marginBottom: 12 }}>
            {item.title}
          </Typography>
        )}
        <VStack spacing={12}>
          {cardItems.map((childItem) => renderContentItem(childItem))}
        </VStack>
      </Card>
    );
  };

  const renderContentItem = (item: ContentItem): React.ReactNode => {
    // Check for custom renderer first
    if (customRenderers[item.type]) {
      return customRenderers[item.type]?.(item);
    }

    switch (item.type) {
      case 'text':
      case 'heading':
        return renderText(item);
      case 'paragraph':
        return renderParagraph(item);
      case 'image':
        return renderImage(item);
      case 'link':
        return renderLink(item);
      case 'button':
        return renderButton(item);
      case 'list':
        return renderList(item);
      case 'quote':
        return renderQuote(item);
      case 'code':
        return renderCode(item);
      case 'divider':
        return renderDivider(item);
      case 'card':
        return renderCard(item);
      case 'custom':
      default:
        return (
          <View key={item.id} style={item.style}>
            {item.content && (
              <Typography variant="body">{item.content}</Typography>
            )}
            {item.items?.map((childItem) => renderContentItem(childItem))}
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <LoadingState message="Loading content..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ ...styles.container, ...(style || {}) }}>
        <EmptyState message="No content to display" />
      </View>
    );
  }

  const content = (
    <VStack spacing={gap} style={{ ...styles.container, ...(style || {}) }}>
      {items.map((item) => renderContentItem(item))}
    </VStack>
  );

  if (scrollable) {
    return (
      <ScrollView style={{ ...styles.container, ...(style || {}) }} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCaption: {
    marginTop: 8,
    textAlign: 'center',
  },
  quote: {
    padding: 16,
    paddingLeft: 20,
    borderLeftWidth: 4,
    borderRadius: 4,
  },
  code: {
    padding: 12,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});

ContentRenderer.displayName = 'ContentRenderer';
