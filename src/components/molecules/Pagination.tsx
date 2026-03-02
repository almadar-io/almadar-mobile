import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { HStack } from '../atoms/Stack';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event name - emits UI:${changeEvent} via eventBus */
  changeEvent?: string;
  /** Maximum number of page buttons to show */
  maxVisiblePages?: number;
  /** Whether to show first/last buttons */
  showFirstLast?: boolean;
  /** Label for previous button */
  prevLabel?: string;
  /** Label for next button */
  nextLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  style,
  isLoading,
  error,
  changeEvent,
  maxVisiblePages = 5,
  showFirstLast = true,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { page, totalPages });
    }
    onPageChange?.(page);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <LoadingState message="Loading pages..." />
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

  if (totalPages <= 1) {
    return null;
  }

  // Calculate visible page range
  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <HStack spacing={4} align="center" justify="center" style={[styles.container, style || {}]}>
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoPrev}
          onPress={() => handlePageChange(1)}
        >
          {'<<'}
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        disabled={!canGoPrev}
        onPress={() => handlePageChange(currentPage - 1)}
      >
        {prevLabel}
      </Button>

      {visiblePages[0] > 1 && (
        <View style={styles.ellipsis}>
          <Typography variant="body" color={theme.colors['muted-foreground']}>
            ...
          </Typography>
        </View>
      )}

      {visiblePages.map((page) => {
        const isActive = page === currentPage;
        return (
          <TouchableOpacity
            key={page}
            onPress={() => handlePageChange(page)}
            style={[
              styles.pageButton,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Typography
              variant="body"
              style={{
                color: isActive
                  ? theme.colors['primary-foreground']
                  : theme.colors.foreground,
              }}
            >
              {page}
            </Typography>
          </TouchableOpacity>
        );
      })}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <View style={styles.ellipsis}>
          <Typography variant="body" color={theme.colors['muted-foreground']}>
            ...
          </Typography>
        </View>
      )}

      <Button
        variant="secondary"
        size="sm"
        disabled={!canGoNext}
        onPress={() => handlePageChange(currentPage + 1)}
      >
        {nextLabel}
      </Button>

      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoNext}
          onPress={() => handlePageChange(totalPages)}
        >
          {'>>'}
        </Button>
      )}
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  ellipsis: {
    minWidth: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Pagination.displayName = 'Pagination';
