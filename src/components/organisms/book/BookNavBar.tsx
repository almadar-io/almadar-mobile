import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { ProgressBar } from '../../atoms/ProgressBar';
import { HStack, VStack } from '../../atoms/Stack';
import { Icon } from '../../atoms/Icon';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';

export interface BookNavBarProps {
  /** Current chapter number */
  currentChapter: number;
  /** Total number of chapters */
  totalChapters: number;
  /** Current page number */
  currentPage?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Reading progress percentage (0-100) */
  progress?: number;
  /** Whether previous chapter is available */
  hasPrevious?: boolean;
  /** Whether next chapter is available */
  hasNext?: boolean;
  /** Whether to show page numbers */
  showPageNumbers?: boolean;
  /** Whether to show chapter list button */
  showTocButton?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event emitted when previous chapter is requested */
  previousEvent?: string;
  /** Event emitted when next chapter is requested */
  nextEvent?: string;
  /** Event emitted when TOC is requested */
  tocEvent?: string;
  /** Payload to include with events */
  actionPayload?: Record<string, unknown>;
}

export const BookNavBar: React.FC<BookNavBarProps> = ({
  currentChapter,
  totalChapters,
  currentPage,
  totalPages,
  progress,
  hasPrevious = true,
  hasNext = true,
  showPageNumbers = true,
  showTocButton = true,
  style,
  isLoading,
  error,
  previousEvent,
  nextEvent,
  tocEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePrevious = () => {
    if (previousEvent && hasPrevious) {
      eventBus.emit(`UI:${previousEvent}`, {
        ...actionPayload,
        currentChapter,
        direction: 'previous',
      });
    }
  };

  const handleNext = () => {
    if (nextEvent && hasNext) {
      eventBus.emit(`UI:${nextEvent}`, {
        ...actionPayload,
        currentChapter,
        direction: 'next',
      });
    }
  };

  const handleToc = () => {
    if (tocEvent) {
      eventBus.emit(`UI:${tocEvent}`, { ...actionPayload, currentChapter });
    }
  };

  // Calculate progress from current position if not provided
  const calculatedProgress = progress ??
    (totalChapters > 0 ? ((currentChapter - 1) / totalChapters) * 100 : 0);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      <VStack spacing={theme.spacing[3]}>
        {/* Progress Bar */}
        <ProgressBar
          progress={calculatedProgress}
          size="sm"
          trackStyle={{ backgroundColor: theme.colors.muted }}
          fillStyle={{ backgroundColor: theme.colors.primary }}
        />

        {/* Navigation Controls */}
        <HStack justify="space-between" align="center" style={styles.controls}>
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="sm"
            onPress={handlePrevious}
            disabled={!hasPrevious}
            actionPayload={actionPayload}
          >
            <HStack spacing={theme.spacing[1]} align="center">
              <Icon
                name="chevron-left"
                size={16}
                color={hasPrevious ? theme.colors.primary : theme.colors['muted-foreground']}
              />
              <Typography
                variant="caption"
                color={hasPrevious ? theme.colors.primary : theme.colors['muted-foreground']}
              >
                Previous
              </Typography>
            </HStack>
          </Button>

          {/* Center Info */}
          <VStack align="center" spacing={theme.spacing[1]}>
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              Chapter {currentChapter} of {totalChapters}
            </Typography>
            {showPageNumbers && currentPage !== undefined && totalPages !== undefined && (
              <Typography variant="caption" color={theme.colors['muted-foreground']}>
                Page {currentPage} of {totalPages}
              </Typography>
            )}
          </VStack>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="sm"
            onPress={handleNext}
            disabled={!hasNext}
            actionPayload={actionPayload}
          >
            <HStack spacing={theme.spacing[1]} align="center">
              <Typography
                variant="caption"
                color={hasNext ? theme.colors.primary : theme.colors['muted-foreground']}
              >
                Next
              </Typography>
              <Icon
                name="chevron-right"
                size={16}
                color={hasNext ? theme.colors.primary : theme.colors['muted-foreground']}
              />
            </HStack>
          </Button>
        </HStack>

        {/* TOC Button */}
        {showTocButton && tocEvent && (
          <Button
            variant="secondary"
            size="sm"
            onPress={handleToc}
            action={tocEvent}
            actionPayload={actionPayload}
            style={styles.tocButton}
          >
            <HStack spacing={theme.spacing[1]} align="center">
              <Icon name="menu" size={14} color={theme.colors['secondary-foreground']} />
              <Typography variant="caption">Table of Contents</Typography>
            </HStack>
          </Button>
        )}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  controls: {
    paddingHorizontal: 8,
  },
  tocButton: {
    alignSelf: 'center',
    minWidth: 150,
  },
});

BookNavBar.displayName = 'BookNavBar';
