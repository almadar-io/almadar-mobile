import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Typography } from '../../atoms/Typography';
import { VStack, HStack } from '../../atoms/Stack';
import { Card } from '../../atoms/Card';
import { Badge } from '../../atoms/Badge';
import { LoadingState } from '../../molecules/LoadingState';
import { ErrorState } from '../../molecules/ErrorState';

export interface BookCoverPageProps {
  /** Book title */
  title: string;
  /** Book author */
  author?: string;
  /** Book cover image URL */
  coverImage?: string;
  /** Book description/summary */
  description?: string;
  /** Publication year */
  year?: number | string;
  /** Genre or category */
  genre?: string;
  /** Edition info */
  edition?: string;
  /** Publisher info */
  publisher?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Cover image style */
  coverStyle?: ImageStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Event emitted when cover is tapped */
  selectEvent?: string;
  /** Event emitted when author is tapped */
  authorEvent?: string;
  /** Payload to include with events */
  actionPayload?: Record<string, unknown>;
}

export const BookCoverPage: React.FC<BookCoverPageProps> = ({
  title,
  author,
  coverImage,
  description,
  year,
  genre,
  edition,
  publisher,
  style,
  coverStyle,
  isLoading,
  error,
  selectEvent,
  authorEvent,
  actionPayload,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  // Cover press handler - currently using Card's action prop instead
  // const handleCoverPress = () => {
  //   if (selectEvent) {
  //     eventBus.emit(`UI:${selectEvent}`, { ...actionPayload, title, author });
  //   }
  // };

  const handleAuthorPress = () => {
    if (authorEvent) {
      eventBus.emit(`UI:${authorEvent}`, { ...actionPayload, author });
    }
  };

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
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <Card
      style={[styles.container, ...(style ? [style] : [])]}
      padding="lg"
      action={selectEvent}
      actionPayload={actionPayload}
    >
      <VStack align="center" spacing={theme.spacing[6]}>
        {/* Cover Image */}
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={[styles.coverImage, coverStyle]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.muted }]}>
            <Typography variant="h1" color={theme.colors['muted-foreground']}>
              📚
            </Typography>
          </View>
        )}

        {/* Book Info */}
        <VStack align="center" spacing={theme.spacing[2]}>
          <Typography variant="h2" align="center">
            {title}
          </Typography>

          {author && (
            <Typography
              variant="body"
              color={theme.colors['muted-foreground']}
              align="center"
            >
              by{' '}
              <Typography
                variant="body"
                color={theme.colors.primary}
                onPress={handleAuthorPress}
              >
                {author}
              </Typography>
            </Typography>
          )}

          {/* Metadata */}
          <HStack spacing={theme.spacing[2]} style={styles.metadata}>
            {year && (
              <Badge variant="secondary">{year}</Badge>
            )}
            {genre && (
              <Badge variant="default">{genre}</Badge>
            )}
            {edition && (
              <Badge variant="secondary">{edition}</Badge>
            )}
          </HStack>

          {publisher && (
            <Typography variant="caption" color={theme.colors['muted-foreground']}>
              {publisher}
            </Typography>
          )}
        </VStack>

        {/* Description */}
        {description && (
          <Typography
            variant="body"
            color={theme.colors['muted-foreground']}
            align="center"
            style={styles.description}
          >
            {description}
          </Typography>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadata: {
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  description: {
    marginTop: 16,
    lineHeight: 24,
  },
});

BookCoverPage.displayName = 'BookCoverPage';
