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

export interface LayoutPattern {
  id: string;
  name: string;
  description: string;
  category: 'flex' | 'grid' | 'stack' | 'position';
  complexity: 'simple' | 'medium' | 'complex';
  preview?: React.ReactNode;
  properties?: Array<{
    name: string;
    type: string;
    description: string;
    default?: string;
  }>;
  codeExample?: string;
}

export interface LayoutPatternsProps {
  /** Layout patterns to display */
  patterns: LayoutPattern[];
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
  /** Declarative select event - emits UI:LAYOUT_SELECT via eventBus */
  selectEvent?: string;
  /** Declarative apply event - emits UI:LAYOUT_APPLY via eventBus */
  applyEvent?: string;
}

export const LayoutPatterns: React.FC<LayoutPatternsProps> = ({
  patterns,
  selectedPatternId,
  onPatternSelect,
  style,
  isLoading,
  error,
  selectEvent,
  applyEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePatternSelect = (patternId: string) => {
    if (selectEvent) {
      eventBus.emit(`UI:${selectEvent}`, { patternId });
    }
    onPatternSelect?.(patternId);
  };

  const handleApplyPattern = (pattern: LayoutPattern) => {
    if (applyEvent) {
      eventBus.emit(`UI:${applyEvent}`, { pattern });
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading layout patterns..." />
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
        <EmptyState message="No layout patterns available" />
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
  }, {} as Record<string, LayoutPattern[]>);

  const getComplexityVariant = (
    complexity: LayoutPattern['complexity']
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

  const getCategoryIcon = (category: LayoutPattern['category']): string => {
    const icons: Record<string, string> = {
      flex: '↔️',
      grid: '⊞',
      stack: '☰',
      position: '⌖',
    };
    return icons[category] || '📐';
  };

  const renderPatternCard = (pattern: LayoutPattern) => {
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
                <Typography variant="h4">
                  {getCategoryIcon(pattern.category)} {pattern.name}
                </Typography>
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

            {pattern.properties && pattern.properties.length > 0 && (
              <VStack spacing={4}>
                <Typography variant="label">Properties:</Typography>
                {pattern.properties.map((prop, index) => (
                  <HStack key={index} spacing={8} align="center">
                    <Typography variant="caption" style={styles.propertyName}>
                      {prop.name}
                    </Typography>
                    <Badge variant="secondary" size="sm">
                      {prop.type}
                    </Badge>
                    {prop.default && (
                      <Typography variant="caption" color={theme.colors['muted-foreground']}>
                        = {prop.default}
                      </Typography>
                    )}
                  </HStack>
                ))}
              </VStack>
            )}

            {isSelected && applyEvent && (
              <Button variant="primary" size="sm" onPress={() => handleApplyPattern(pattern)}>
                Apply Layout
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
        <Typography variant="h3">Layout Patterns</Typography>

        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack spacing={16}>
            {Object.entries(groupedPatterns).map(([category, categoryPatterns]) => (
              <VStack key={category} spacing={12}>
                <Typography variant="h4" style={{ color: theme.colors.primary }}>
                  {getCategoryIcon(category as LayoutPattern['category'])} {category.toUpperCase()}
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
  propertyName: {
    fontFamily: 'monospace',
    minWidth: 100,
  },
});

LayoutPatterns.displayName = 'LayoutPatterns';
