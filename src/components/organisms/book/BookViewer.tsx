import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, Modal } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Typography } from '../../atoms/Typography';

import { Button } from '../../atoms/Button';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';
import { EmptyState } from '../../molecules/EmptyState';
import { BookChapterView } from './BookChapterView';
import { BookCoverPage, BookCoverPageProps } from './BookCoverPage';
import { BookNavBar } from './BookNavBar';
import { BookTableOfContents, BookChapter } from './BookTableOfContents';

export interface BookViewerProps {
  /** Book metadata */
  book: Omit<BookCoverPageProps, 'isLoading' | 'error' | 'entity' | 'selectEvent' | 'authorEvent' | 'actionPayload' | 'style'>;
  /** Array of chapters */
  chapters: BookChapter[];
  /** Currently active chapter index (0-based) */
  currentChapterIndex?: number;
  /** Reading progress percentage (0-100) */
  progress?: number;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Whether to show the cover page initially */
  showCover?: boolean;
  /** Event emitted when a chapter is selected */
  chapterSelectEvent?: string;
  /** Event emitted when navigation occurs */
  navigateEvent?: string;
  /** Event emitted when TOC is toggled */
  tocEvent?: string;
  /** Event emitted when book is closed */
  closeEvent?: string;
  /** Payload to include with events */
  actionPayload?: Record<string, unknown>;
}

export const BookViewer: React.FC<BookViewerProps> = ({
  book,
  chapters,
  currentChapterIndex = 0,
  progress,
  style,
  isLoading,
  error,
  showCover = false,
  chapterSelectEvent,
  navigateEvent,
  tocEvent,
  closeEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [showToc, setShowToc] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(showCover);
  const [activeChapterIndex, setActiveChapterIndex] = useState(currentChapterIndex);

  const currentChapter = chapters[activeChapterIndex];
  const totalChapters = chapters.length;

  // Chapter navigation handlers - currently using declarative events instead
  // const handlePreviousChapter = useCallback(() => {
  //   if (activeChapterIndex > 0) {
  //     const newIndex = activeChapterIndex - 1;
  //     setActiveChapterIndex(newIndex);
  //     setShowCoverPage(false);
  //     if (navigateEvent) {
  //       eventBus.emit(`UI:${navigateEvent}`, {
  //         ...actionPayload,
  //         previousIndex: activeChapterIndex,
  //         newIndex,
  //         direction: 'previous',
  //         chapterId: chapters[newIndex]?.id,
  //       });
  //     }
  //   }
  // }, [activeChapterIndex, chapters, navigateEvent, actionPayload, eventBus]);

  // const handleNextChapter = useCallback(() => {
  //   if (activeChapterIndex < totalChapters - 1) {
  //     const newIndex = activeChapterIndex + 1;
  //     setActiveChapterIndex(newIndex);
  //     setShowCoverPage(false);
  //     if (navigateEvent) {
  //       eventBus.emit(`UI:${navigateEvent}`, {
  //         ...actionPayload,
  //         previousIndex: activeChapterIndex,
  //         newIndex,
  //         direction: 'next',
  //         chapterId: chapters[newIndex]?.id,
  //       });
  //     }
  //   }
  // }, [activeChapterIndex, totalChapters, chapters, navigateEvent, actionPayload, eventBus]);

  // const handleChapterSelect = useCallback((chapterId: string) => {
  //   const index = chapters.findIndex((c) => c.id === chapterId);
  //   if (index !== -1) {
  //     setActiveChapterIndex(index);
  //     setShowCoverPage(false);
  //     setShowToc(false);
  //     if (chapterSelectEvent) {
  //       eventBus.emit(`UI:${chapterSelectEvent}`, {
  //         ...actionPayload,
  //         chapterId,
  //         chapterIndex: index,
  //         title: chapters[index]?.title,
  //       });
  //     }
  //   }
  // }, [chapters, chapterSelectEvent, actionPayload, eventBus]);

  // Listen for navigation events from child components
  React.useEffect(() => {
    const handleNav = (data: unknown) => {
      const navData = data as { direction?: string; chapterId?: string; newIndex?: number };
      if (navData.direction === 'previous' && activeChapterIndex > 0) {
        setActiveChapterIndex(prev => prev - 1);
        setShowCoverPage(false);
      } else if (navData.direction === 'next' && activeChapterIndex < totalChapters - 1) {
        setActiveChapterIndex(prev => prev + 1);
        setShowCoverPage(false);
      } else if (navData.newIndex !== undefined && navData.newIndex >= 0 && navData.newIndex < totalChapters) {
        setActiveChapterIndex(navData.newIndex);
        setShowCoverPage(false);
        setShowToc(false);
      } else if (navData.chapterId) {
        const index = chapters.findIndex((c) => c.id === navData.chapterId);
        if (index !== -1) {
          setActiveChapterIndex(index);
          setShowCoverPage(false);
          setShowToc(false);
        }
      }
    };

    if (navigateEvent) {
      eventBus.on(`UI:${navigateEvent}`, handleNav);
    }
    if (chapterSelectEvent) {
      eventBus.on(`UI:${chapterSelectEvent}`, handleNav);
    }

    return () => {
      if (navigateEvent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (eventBus as any).off?.(`UI:${navigateEvent}`, handleNav);
      }
      if (chapterSelectEvent) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (eventBus as any).off?.(`UI:${chapterSelectEvent}`, handleNav);
      }
    };
  }, [navigateEvent, chapterSelectEvent, activeChapterIndex, totalChapters, chapters, eventBus]);

  const handleTocToggle = useCallback(() => {
    setShowToc((prev) => !prev);
    if (tocEvent) {
      eventBus.emit(`UI:${tocEvent}`, {
        ...actionPayload,
        isOpen: !showToc,
        currentChapterIndex: activeChapterIndex,
      });
    }
  }, [showToc, tocEvent, actionPayload, activeChapterIndex, eventBus]);

  const handleClose = useCallback(() => {
    if (closeEvent) {
      eventBus.emit(`UI:${closeEvent}`, { ...actionPayload });
    }
  }, [closeEvent, actionPayload, eventBus]);

  const handleStartReading = useCallback(() => {
    setShowCoverPage(false);
    if (navigateEvent) {
      eventBus.emit(`UI:${navigateEvent}`, {
        ...actionPayload,
        action: 'start_reading',
        chapterIndex: 0,
      });
    }
  }, [navigateEvent, actionPayload, eventBus]);

  // Calculate progress
  const calculatedProgress = progress ??
    (totalChapters > 0 ? (activeChapterIndex / totalChapters) * 100 : 0);

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading book..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorState message={error.message} onRetry={handleClose} />
      </View>
    );
  }

  if (chapters.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <EmptyState
          message="This book has no chapters"
          icon={<Typography variant="h2">📚</Typography>}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* Close Button */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleClose}
          style={styles.closeButton}
        >
          <Typography variant="body" color={theme.colors['muted-foreground']}>
            ✕
          </Typography>
        </Button>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {showCoverPage ? (
          <BookCoverPage
            {...book}
            selectEvent={chapterSelectEvent}
            actionPayload={actionPayload}
          />
        ) : currentChapter ? (
          <BookChapterView
            title={currentChapter.title}
            chapterNumber={currentChapter.number || activeChapterIndex + 1}
            content={currentChapter.title} // Placeholder - in real implementation, fetch chapter content
            viewEvent={chapterSelectEvent}
            actionPayload={{ ...actionPayload, chapterId: currentChapter.id }}
          />
        ) : (
          <EmptyState message="No chapter selected" />
        )}
      </View>

      {/* Start Reading Button (only on cover) */}
      {showCoverPage && (
        <View style={styles.startButtonContainer}>
          <Button variant="primary" size="lg" onPress={handleStartReading}>
            Start Reading
          </Button>
        </View>
      )}

      {/* Navigation Bar (hidden on cover) */}
      {!showCoverPage && (
        <BookNavBar
          currentChapter={activeChapterIndex + 1}
          totalChapters={totalChapters}
          progress={calculatedProgress}
          hasPrevious={activeChapterIndex > 0}
          hasNext={activeChapterIndex < totalChapters - 1}
          previousEvent={navigateEvent}
          nextEvent={navigateEvent}
          tocEvent={tocEvent}
          actionPayload={actionPayload}
        />
      )}

      {/* TOC Modal */}
      <Modal
        visible={showToc}
        transparent
        animationType="slide"
        onRequestClose={handleTocToggle}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Typography variant="h3">Table of Contents</Typography>
              <Button variant="ghost" size="sm" onPress={handleTocToggle}>
                <Typography variant="body" color={theme.colors['muted-foreground']}>
                  ✕
                </Typography>
              </Button>
            </View>
            <BookTableOfContents
              chapters={chapters}
              activeChapterId={currentChapter?.id}
              bookTitle={book.title}
              selectEvent={chapterSelectEvent}
              actionPayload={actionPayload}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  startButtonContainer: {
    padding: 24,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
});

BookViewer.displayName = 'BookViewer';
