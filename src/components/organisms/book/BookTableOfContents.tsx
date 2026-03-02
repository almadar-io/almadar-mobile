import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Typography } from '../../atoms/Typography';
import { VStack, HStack } from '../../atoms/Stack';
import { Card } from '../../atoms/Card';
import { Divider } from '../../atoms/Divider';
import { Icon } from '../../atoms/Icon';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';
import { EmptyState } from '../../molecules/EmptyState';

export interface BookChapter {
  id: string;
  title: string;
  number?: number;
  pageNumber?: number;
  isLocked?: boolean;
  isCompleted?: boolean;
}

export interface BookTableOfContentsProps {
  /** Array of chapters */
  chapters: BookChapter[];
  /** Currently active chapter ID */
  activeChapterId?: string;
  /** Book title */
  bookTitle?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event emitted when a chapter is selected */
  selectEvent?: string;
  /** Payload to include with events */
  actionPayload?: Record<string, unknown>;
}

export const BookTableOfContents: React.FC<BookTableOfContentsProps> = ({
  chapters,
  activeChapterId,
  bookTitle,
  style,
  isLoading,
  error,
  selectEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleChapterPress = (chapter: BookChapter) => {
    if (chapter.isLocked) return;
    if (selectEvent) {
      eventBus.emit(`UI:${selectEvent}`, {
        ...actionPayload,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        title: chapter.title,
      });
    }
  };

  const renderChapter = ({ item, index }: { item: BookChapter; index: number }) => {
    const isActive = item.id === activeChapterId;
    const showDivider = index < chapters.length - 1;

    return (
      <View>
        <TouchableOpacity
          onPress={() => handleChapterPress(item)}
          disabled={item.isLocked}
          activeOpacity={0.7}
          style={[
            styles.chapterItem,
            isActive && { backgroundColor: theme.colors.primary + '10' },
            item.isLocked && styles.lockedItem,
          ]}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={theme.spacing[3]} align="center" style={styles.chapterInfo}>
              {/* Chapter Number or Status Icon */}
              <View style={styles.numberContainer}>
                {item.isCompleted ? (
                  <Icon name="check" size={16} color={theme.colors.success} />
                ) : item.isLocked ? (
                  <Typography variant="caption" color={theme.colors['muted-foreground']}>
                    🔒
                  </Typography>
                ) : (
                  <Typography
                    variant="caption"
                    color={isActive ? theme.colors.primary : theme.colors['muted-foreground']}
                  >
                    {item.number || index + 1}
                  </Typography>
                )}
              </View>

              {/* Chapter Title */}
              <VStack spacing={theme.spacing[1]}>
                <Typography
                  variant="body"
                  color={
                    item.isLocked
                      ? theme.colors['muted-foreground']
                      : isActive
                        ? theme.colors.primary
                        : theme.colors.foreground
                  }
                >
                  {item.title}
                </Typography>
                {item.pageNumber !== undefined && (
                  <Typography variant="caption" color={theme.colors['muted-foreground']}>
                    Page {item.pageNumber}
                  </Typography>
                )}
              </VStack>
            </HStack>

            {/* Active Indicator */}
            {isActive && (
              <Icon name="chevron-right" size={16} color={theme.colors.primary} />
            )}
          </HStack>
        </TouchableOpacity>

        {showDivider && <Divider thickness={0.5} />}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading table of contents..." />
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

  if (chapters.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState message="No chapters available" icon={<Typography variant="h2">📑</Typography>} />
      </View>
    );
  }

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]} padding="md">
      <VStack spacing={theme.spacing[4]}>
        {/* Header */}
        {bookTitle && (
          <View style={styles.header}>
            <Typography variant="h3" align="center">
              {bookTitle}
            </Typography>
            <Typography variant="caption" color={theme.colors['muted-foreground']} align="center">
              Table of Contents
            </Typography>
          </View>
        )}

        {/* Chapter List */}
        <FlatList
          data={chapters}
          renderItem={renderChapter}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
        />
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  listContent: {
    paddingVertical: 8,
  },
  chapterItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  lockedItem: {
    opacity: 0.6,
  },
  chapterInfo: {
    flex: 1,
  },
  numberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

BookTableOfContents.displayName = 'BookTableOfContents';
