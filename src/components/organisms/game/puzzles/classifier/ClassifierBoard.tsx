/**
 * ClassifierBoard
 *
 * Drag-and-drop classification game. The player sorts items
 * into the correct category buckets. All items must be correctly
 * classified to win.
 *
 * Good for: taxonomy, pattern recognition, sorting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Button } from '../../../../atoms/Button';
import { Typography } from '../../../../atoms/Typography';
import { Badge } from '../../../../atoms/Badge';
import { VStack, HStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

export interface ClassifierItem {
  id: string;
  label: string;
  description?: string;
  correctCategory: string;
  /** Image URL icon for story-specific visual skin */
  iconUrl?: string;
}

export interface ClassifierCategory {
  id: string;
  label: string;
  color?: string;
  /** Image URL for story-specific category header */
  imageUrl?: string;
}

export interface ClassifierPuzzleEntity {
  id: string;
  title: string;
  description: string;
  items: ClassifierItem[];
  categories: ClassifierCategory[];
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface ClassifierBoardProps {
  entity: ClassifierPuzzleEntity;
  completeEvent?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const ClassifierBoard: React.FC<ClassifierBoardProps> = ({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const unassignedItems = entity.items.filter((item) => !assignments[item.id]);
  const allAssigned = Object.keys(assignments).length === entity.items.length;

  const results = submitted
    ? entity.items.map((item) => ({
        item,
        assigned: assignments[item.id],
        correct: assignments[item.id] === item.correctCategory,
      }))
    : [];

  const allCorrect = results.length > 0 && results.every((r) => r.correct);
  const correctCount = results.filter((r) => r.correct).length;

  const handleAssign = (itemId: string, categoryId: string) => {
    if (submitted) return;
    setAssignments((prev) => ({ ...prev, [itemId]: categoryId }));
  };

  const handleUnassign = (itemId: string) => {
    if (submitted) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = entity.items.every((item) => assignments[item.id] === item.correctCategory);
    if (correct) {
      eventBus.emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [entity.items, assignments, attempts, completeEvent, eventBus]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setAssignments({});
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };

  if (isLoading) {
    return <LoadingState message="Loading puzzle..." />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <ScrollView style={[styles.container, style]}>
      <VStack spacing={16} style={styles.content}>
        {/* Title Card */}
        <Card>
          <VStack spacing={8}>
            <Typography variant="h4">{entity.title}</Typography>
            <Typography variant="body">{entity.description}</Typography>
          </VStack>
        </Card>

        {/* Unassigned items */}
        {unassignedItems.length > 0 && (
          <Card>
            <VStack spacing={12}>
              <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                ITEMS TO SORT
              </Typography>
              <HStack spacing={8} style={styles.wrap}>
                {unassignedItems.map((item) => (
                  <Badge key={item.id} size="md">
                    {item.label}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Category buckets */}
        <VStack spacing={16}>
          {entity.categories.map((cat) => {
            const catItems = entity.items.filter((item) => assignments[item.id] === cat.id);
            return (
              <Card key={cat.id}>
                <VStack spacing={12}>
                  <HStack justify="space-between" align="center">
                    <Typography variant="body" style={{ fontWeight: '600' }}>
                      {cat.label}
                    </Typography>
                    <Badge size="sm">{catItems.length}</Badge>
                  </HStack>
                  <HStack spacing={8} style={styles.wrap}>
                    {catItems.map((item) => {
                      const result = results.find((r) => r.item.id === item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleUnassign(item.id)}
                          disabled={submitted}
                        >
                          <View
                            style={[
                              styles.assignedBadge,
                              result && {
                                backgroundColor: result.correct
                                  ? `${theme.colors.success}20`
                                  : `${theme.colors.error}20`,
                                borderColor: result.correct ? theme.colors.success : theme.colors.error,
                                borderWidth: 1,
                              },
                            ]}
                          >
                            <Typography variant="caption">{item.label}</Typography>
                            {result && (
                              <Typography variant="caption">
                                {result.correct ? ' ✓' : ' ✗'}
                              </Typography>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </HStack>
                  {/* Assignment buttons for unassigned items */}
                  {!submitted && unassignedItems.length > 0 && (
                    <HStack spacing={8} style={styles.wrap}>
                      {unassignedItems.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => handleAssign(item.id, cat.id)}
                          style={styles.assignButton}
                        >
                          <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                            + {item.label}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </Card>
            );
          })}
        </VStack>

        {/* Result */}
        {submitted && (
          <Card>
            <VStack spacing={12} align="center">
              <Typography variant="h4">{allCorrect ? '✅' : '❌'}</Typography>
              <Typography variant="body" style={{ fontWeight: '600', textAlign: 'center' }}>
                {allCorrect
                  ? (entity.successMessage ?? 'All items correctly classified!')
                  : `${correctCount}/${entity.items.length} correct`}
              </Typography>
              {!allCorrect && entity.failMessage && (
                <Typography variant="body" style={{ color: theme.colors['muted-foreground'], textAlign: 'center' }}>
                  {entity.failMessage}
                </Typography>
              )}
            </VStack>
          </Card>
        )}

        {/* Hint */}
        {showHint && entity.hint && (
          <Card style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.warning }}>
            <Typography variant="body">💡 {entity.hint}</Typography>
          </Card>
        )}

        {/* Actions */}
        <HStack spacing={8} justify="center">
          {!submitted ? (
            <Button variant="primary" onPress={handleSubmit} disabled={!allAssigned}>
              📤 Check
            </Button>
          ) : !allCorrect ? (
            <Button variant="primary" onPress={handleReset}>
              Try Again
            </Button>
          ) : null}
          <Button variant="secondary" onPress={handleFullReset}>
            🔄 Reset
          </Button>
        </HStack>
      </VStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  assignButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

ClassifierBoard.displayName = 'ClassifierBoard';
