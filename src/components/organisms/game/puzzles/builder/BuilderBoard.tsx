/**
 * BuilderBoard
 *
 * Component-snapping game board. The player places components
 * onto slots in a blueprint. Correct placement completes the build.
 *
 * Good for: architecture, circuits, molecules, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
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

export interface BuilderComponent {
  id: string;
  label: string;
  description?: string;
  iconEmoji?: string;
  /** Image URL icon (takes precedence over iconEmoji) */
  iconUrl?: string;
  category?: string;
}

export interface BuilderSlot {
  id: string;
  label: string;
  description?: string;
  acceptsComponentId: string;
}

export interface BuilderPuzzleEntity {
  id: string;
  title: string;
  description: string;
  components: BuilderComponent[];
  slots: BuilderSlot[];
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface BuilderBoardProps {
  entity: BuilderPuzzleEntity;
  completeEvent?: string;
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

export const BuilderBoard: React.FC<BuilderBoardProps> = ({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const usedComponentIds = new Set(Object.values(placements));
  const availableComponents = entity.components.filter((c) => !usedComponentIds.has(c.id));
  const allPlaced = Object.keys(placements).length === entity.slots.length;

  const results = submitted
    ? entity.slots.map((slot) => ({
        slot,
        placed: placements[slot.id],
        correct: placements[slot.id] === slot.acceptsComponentId,
      }))
    : [];

  const allCorrect = results.length > 0 && results.every((r) => r.correct);

  const handlePlaceComponent = (slotId: string) => {
    if (submitted || !selectedComponent) return;
    setPlacements((prev) => ({ ...prev, [slotId]: selectedComponent }));
    setSelectedComponent(null);
  };

  const handleRemoveFromSlot = (slotId: string) => {
    if (submitted) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = entity.slots.every((slot) => placements[slot.id] === slot.acceptsComponentId);
    if (correct) {
      eventBus.emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [entity.slots, placements, attempts, completeEvent, eventBus]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && entity.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setPlacements({});
    setSubmitted(false);
    setSelectedComponent(null);
    setAttempts(0);
    setShowHint(false);
  };

  const getComponentById = (id: string): BuilderComponent | undefined =>
    entity.components.find((c) => c.id === id);

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

        {/* Available components */}
        <Card>
          <VStack spacing={12}>
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              COMPONENTS
            </Typography>
            <HStack spacing={8} style={styles.wrap}>
              {availableComponents.map((comp) => (
                <TouchableOpacity
                  key={comp.id}
                  onPress={() => setSelectedComponent(selectedComponent === comp.id ? null : comp.id)}
                  disabled={submitted}
                >
                  <View
                    style={[
                      styles.componentButton,
                      {
                        backgroundColor:
                          selectedComponent === comp.id
                            ? theme.colors.primary
                            : theme.colors.secondary,
                      },
                    ]}
                  >
                    <Text style={{ color: selectedComponent === comp.id ? theme.colors['primary-foreground'] : theme.colors['secondary-foreground'] }}>
                      {comp.iconEmoji ? `${comp.iconEmoji} ` : ''}
                      {comp.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {availableComponents.length === 0 && !submitted && (
                <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                  All components placed
                </Typography>
              )}
            </HStack>
          </VStack>
        </Card>

        {/* Blueprint slots */}
        <Card>
          <VStack spacing={12}>
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              BLUEPRINT
            </Typography>
            <VStack spacing={8}>
              {entity.slots.map((slot) => {
                const placedComp = placements[slot.id] ? getComponentById(placements[slot.id]) : null;
                const result = results.find((r) => r.slot.id === slot.id);

                let borderColor = theme.colors.border;
                if (result) {
                  borderColor = result.correct ? theme.colors.success : theme.colors.error;
                } else if (selectedComponent) {
                  borderColor = theme.colors.primary;
                }

                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => handlePlaceComponent(slot.id)}
                    disabled={submitted || !selectedComponent}
                    style={[
                      styles.slotRow,
                      { borderColor },
                      result && !result.correct && { backgroundColor: `${theme.colors.error}10` },
                      result && result.correct && { backgroundColor: `${theme.colors.success}10` },
                    ]}
                  >
                    <VStack spacing={4} style={styles.slotInfo}>
                      <Typography variant="body" style={{ fontWeight: '500' }}>
                        {slot.label}
                      </Typography>
                      {slot.description && (
                        <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                          {slot.description}
                        </Typography>
                      )}
                    </VStack>
                    {placedComp ? (
                      <HStack spacing={8} align="center">
                        <TouchableOpacity onPress={() => handleRemoveFromSlot(slot.id)} disabled={submitted}>
                          <Badge variant={result ? (result.correct ? 'success' : 'error') : 'default'} size="sm">
                            {placedComp.iconEmoji ? `${placedComp.iconEmoji} ` : ''}
                            {placedComp.label}
                          </Badge>
                        </TouchableOpacity>
                        {result && (
                          <Text style={{ fontSize: 16 }}>
                            {result.correct ? '✓' : '✗'}
                          </Text>
                        )}
                      </HStack>
                    ) : (
                      <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
                        Empty
                      </Typography>
                    )}
                  </TouchableOpacity>
                );
              })}
            </VStack>
          </VStack>
        </Card>

        {/* Result */}
        {submitted && (
          <Card>
            <VStack spacing={12} align="center">
              <Text style={{ fontSize: 32 }}>{allCorrect ? '✅' : '❌'}</Text>
              <Typography variant="body" style={{ fontWeight: '600', textAlign: 'center' }}>
                {allCorrect
                  ? (entity.successMessage ?? 'Build successful!')
                  : (entity.failMessage ?? 'Some placements are incorrect.')}
              </Typography>
            </VStack>
          </Card>
        )}

        {showHint && entity.hint && (
          <Card style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.warning }}>
            <Typography variant="body">💡 {entity.hint}</Typography>
          </Card>
        )}

        <HStack spacing={8} justify="center">
          {!submitted ? (
            <Button
              variant="primary"
              onPress={handleSubmit}
              disabled={!allPlaced}
            >
              🔧 Build
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
  componentButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  slotInfo: {
    flex: 1,
  },
});

BuilderBoard.displayName = 'BuilderBoard';
