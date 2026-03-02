import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeContext';
import { useEventBus } from '../../hooks/useEventBus';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { HStack, VStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { EmptyState } from '../molecules/EmptyState';

export interface ComponentPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  preview?: React.ReactNode;
  codeSnippet?: string;
  tags?: string[];
}

export interface ComponentPatternsProps {
  /** Patterns to display */
  patterns: ComponentPattern[];
  /** Selected pattern ID */
  selectedPatternId?: string;
  /** Callback when pattern is selected */
  onPatternSelect?: (patternId: string) => void;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative select event - emits UI:PATTERN_SELECT via eventBus */
  selectEvent?: string;
  /** Declarative use event - emits UI:PATTERN_USE via eventBus */
  useEvent?: string;
}

export const ComponentPatterns: React.FC<ComponentPatternsProps> = ({
  patterns,
  selectedPatternId,
  onPatternSelect,
  style,
  isLoading,
  error,
  selectEvent,
  useEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePatternSelect = (patternId: string) => {
    if (selectEvent) {
      eventBus.emit(`UI:${selectEvent}`, { patternId });
    }
    onPatternSelect?.(patternId);
  };

  const handleUsePattern = (pattern: ComponentPattern) => {
    if (useEvent) {
      eventBus.emit(`UI:${useEvent}`, { pattern });
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading patterns..." />
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

  if (patterns.length === 0) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <EmptyState message="No patterns available" />
      </Card>
    );
  }

  // Group patterns by category
  const groupedPatterns = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = [];
    }
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<string, ComponentPattern[]>);

  const getComplexityVariant = (
    complexity: ComponentPattern['complexity']
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (complexity) {
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

  const renderPatternCard = (pattern: ComponentPattern) => {
    const isSelected = pattern.id === selectedPatternId;

    return (
      <TouchableOpacity
        key={pattern.id}
        onPress={() => handlePatternSelect(pattern.id)}
        activeOpacity={0.9}
      >
        <Card
          style={[
            styles.patternCard,
            ...(isSelected
              ? [{ borderColor: theme.colors.primary, borderWidth: 2 }]
              : []),
          ]}
          padding="md"
        >
          <VStack spacing={12}>
            <HStack justify="space-between" align="flex-start">
              <VStack spacing={4} style={styles.patternInfo}>
                <Typography variant="h4">{pattern.name}</Typography>
                <Typography variant="caption" color={theme.colors['muted-foreground']}>
                  {pattern.description}
                </Typography>
              </VStack>
              <Badge variant={getComplexityVariant(pattern.complexity)}>
                {pattern.complexity}
              </Badge>
            </HStack>

            {pattern.preview && (
              <View style={[styles.previewContainer, { backgroundColor: theme.colors.muted }]}>
                {pattern.preview}
              </View>
            )}

            {pattern.tags && pattern.tags.length > 0 && (
              <HStack spacing={4} style={styles.tags}>
                {pattern.tags.map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </HStack>
            )}

            {isSelected && (
              <Button variant="primary" size="sm" onPress={() => handleUsePattern(pattern)}>
                Use Pattern
              </Button>
            )}
          </VStack>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        <Typography variant="h3">Component Patterns</Typography>

        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack spacing={16}>
            {Object.entries(groupedPatterns).map(([category, categoryPatterns]) => (
              <VStack key={category} spacing={12}>
                <Typography variant="h4" style={{ color: theme.colors.primary }}>
                  {category}
                </Typography>
                <VStack spacing={8}>{categoryPatterns.map(renderPatternCard)}</VStack>
              </VStack>
            ))}
          </VStack>
        </ScrollView>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 600,
  },
  patternCard: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  patternInfo: {
    flex: 1,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tags: {
    flexWrap: 'wrap',
  },
});

ComponentPatterns.displayName = 'ComponentPatterns';
