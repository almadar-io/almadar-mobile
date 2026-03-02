import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { HStack, VStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { CodeBlock } from '../molecules/CodeBlock';

export interface CustomPatternProps {
  /** Pattern name */
  name: string;
  /** Pattern description */
  description?: string;
  /** Pattern category */
  category?: string;
  /** Pattern complexity level */
  complexity?: 'simple' | 'medium' | 'complex';
  /** Custom preview component */
  preview?: React.ReactNode;
  /** Code implementation */
  code?: string;
  /** Language of the code */
  language?: string;
  /** Pattern tags */
  tags?: string[];
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative edit event - emits UI:PATTERN_EDIT via eventBus */
  editEvent?: string;
  /** Declarative delete event - emits UI:PATTERN_DELETE via eventBus */
  deleteEvent?: string;
  /** Declarative use event - emits UI:PATTERN_USE via eventBus */
  useEvent?: string;
}

export const CustomPattern: React.FC<CustomPatternProps> = ({
  name,
  description,
  category,
  complexity = 'medium',
  preview,
  code,
  language = 'typescript',
  tags,
  style,
  isLoading,
  error,
  editEvent,
  deleteEvent,
  useEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleEdit = () => {
    if (editEvent) {
      eventBus.emit(`UI:${editEvent}`, { name });
    }
  };

  const handleDelete = () => {
    if (deleteEvent) {
      eventBus.emit(`UI:${deleteEvent}`, { name });
    }
  };

  const handleUse = () => {
    if (useEvent) {
      eventBus.emit(`UI:${useEvent}`, { name });
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading pattern..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <ErrorState message={error.message} />
      </Card>
    );
  }

  const getComplexityVariant = (
    comp: CustomPatternProps['complexity']
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (comp) {
      case 'simple':
        return 'success';
      case 'medium':
        return 'warning';
      case 'complex':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack spacing={4} style={styles.headerInfo}>
            <Typography variant="h3">{name}</Typography>
            {category && (
              <Typography variant="caption" color={theme.colors['muted-foreground']}>
                {category}
              </Typography>
            )}
          </VStack>
          <Badge variant={getComplexityVariant(complexity)}>{complexity}</Badge>
        </HStack>

        {/* Description */}
        {description && (
          <Typography variant="body" color={theme.colors['muted-foreground']}>
            {description}
          </Typography>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <HStack spacing={4} style={styles.tags}>
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
          </HStack>
        )}

        {/* Preview */}
        {preview && (
          <View style={[styles.previewContainer, { backgroundColor: theme.colors.muted }]}>
            <Typography variant="label" style={styles.previewLabel}>
              Preview
            </Typography>
            {preview}
          </View>
        )}

        {/* Code */}
        {code && (
          <VStack spacing={8}>
            <Typography variant="label">Implementation</Typography>
            <CodeBlock
              code={code}
              language={language}
              showLineNumbers
              showCopyButton
              scrollable
            />
          </VStack>
        )}

        {/* Actions */}
        <HStack spacing={8} style={styles.actions}>
          {useEvent && (
            <Button variant="primary" onPress={handleUse} style={styles.actionButton}>
              Use Pattern
            </Button>
          )}
          {editEvent && (
            <Button variant="secondary" onPress={handleEdit} style={styles.actionButton}>
              Edit
            </Button>
          )}
          {deleteEvent && (
            <Button variant="ghost" onPress={handleDelete} style={styles.actionButton}>
              Delete
            </Button>
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  headerInfo: {
    flex: 1,
  },
  tags: {
    flexWrap: 'wrap',
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    opacity: 0.5,
  },
  actions: {
    marginTop: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
  },
});

CustomPattern.displayName = 'CustomPattern';
