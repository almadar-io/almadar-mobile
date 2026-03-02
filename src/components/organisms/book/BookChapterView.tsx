import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';

export interface BookChapterViewProps {
  /** Chapter title */
  title: string;
  /** Chapter content - can be text or React nodes */
  content: string | React.ReactNode;
  /** Chapter number */
  chapterNumber?: number;
  /** Optional subtitle */
  subtitle?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event emitted when chapter is viewed */
  viewEvent?: string;
  /** Payload to include with events */
  actionPayload?: Record<string, unknown>;
}

export const BookChapterView: React.FC<BookChapterViewProps> = ({
  title,
  content,
  chapterNumber,
  subtitle,
  style,
  isLoading,
  error,
  viewEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  React.useEffect(() => {
    if (viewEvent) {
      eventBus.emit(`UI:${viewEvent}`, { ...actionPayload, title, chapterNumber });
    }
  }, [viewEvent, title, chapterNumber, actionPayload, eventBus]);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading chapter..." />
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

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <VStack spacing={theme.spacing[4]}>
        {/* Chapter Header */}
        <View style={styles.header}>
          {chapterNumber !== undefined && (
            <Typography
              variant="caption"
              color={theme.colors['muted-foreground']}
            >
              Chapter {chapterNumber}
            </Typography>
          )}
          <Typography variant="h2">{title}</Typography>
          {subtitle && (
            <Typography
              variant="body"
              color={theme.colors['muted-foreground']}
            >
              {subtitle}
            </Typography>
          )}
        </View>

        {/* Chapter Content */}
        <View style={styles.content}>
          {typeof content === 'string' ? (
            <Typography variant="body" style={styles.textContent}>
              {content}
            </Typography>
          ) : (
            content
          )}
        </View>
      </VStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  content: {
    marginTop: 8,
  },
  textContent: {
    lineHeight: 28,
  },
});

BookChapterView.displayName = 'BookChapterView';
