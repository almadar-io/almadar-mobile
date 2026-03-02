/**
 * SequencerBoard
 *
 * Sequence puzzle for React Native (ages 5-8).
 * Kids tap actions to build a sequence, then play to see if it's correct.
 *
 * Feedback-first UX:
 * - On failure: slots stay in place, each slot gets a green or red
 *   indicator showing exactly which steps are correct and which need to change.
 * - Modifying a slot clears its individual feedback so the kid can re-try.
 * - After 3 failures a persistent hint appears.
 * - "Reset" clears everything including attempts / hint.
 *
 * Events emitted via playEvent and completeEvent.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Button } from '../../../../atoms/Button';
import { Typography } from '../../../../atoms/Typography';

import { VStack, HStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

// =============================================================================
// Types
// =============================================================================

export interface SequencerAction {
  id: string;
  name: string;
  category: string;
  description?: string;
  iconEmoji?: string;
}

export interface SequencerPuzzleEntity {
  id: string;
  title: string;
  description: string;
  /** Available actions the kid can use */
  availableActions: SequencerAction[];
  /** How many slots in the sequence bar */
  maxSlots: number;
  /** Whether actions can be reused */
  allowDuplicates?: boolean;
  /** The correct sequence(s) — list of action IDs. First match wins. */
  solutions: string[][];
  /** Feedback messages */
  successMessage?: string;
  failMessage?: string;
  /** Progressive hint shown after 3 failures */
  hint?: string;
}

export interface SequencerBoardProps {
  /** Puzzle data */
  entity: SequencerPuzzleEntity;
  /** Category → color mapping */
  categoryColors?: Record<string, { bg: string; border: string }>;
  /** Playback speed in ms per step */
  stepDurationMs?: number;
  /** Emits UI:{playEvent} with { sequence: string[] } */
  playEvent?: string;
  /** Emits UI:{completeEvent} with { success: boolean } */
  completeEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entityName?: string;
}

type PlayState = 'idle' | 'playing' | 'success';

/** Encouraging messages shown on failure, cycled through */
const ENCOURAGEMENT_MESSAGES = [
  'Keep trying! You can do it!',
  'Almost there! Try again!',
  'Don\'t give up! One more time!',
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Returns per-slot feedback by comparing playerSeq against the best-matching
 * solution (the one with the most positionally-correct slots).
 */
function computeSlotFeedback(
  playerSeq: Array<string | undefined>,
  solutions: string[][],
): Array<'correct' | 'wrong'> {
  let bestSolution = solutions[0];
  let bestMatches = -1;
  for (const sol of solutions) {
    const matches = sol.filter((id, i) => id === playerSeq[i]).length;
    if (matches > bestMatches) {
      bestMatches = matches;
      bestSolution = sol;
    }
  }
  return playerSeq.map((id, i) =>
    id !== undefined && id === bestSolution[i] ? 'correct' : 'wrong',
  );
}

// =============================================================================
// Component
// =============================================================================

export const SequencerBoard: React.FC<SequencerBoardProps> = ({
  entity,
  categoryColors,
  stepDurationMs = 1000,
  playEvent,
  completeEvent,
  style,
  isLoading,
  error,
}) => {
  useTheme();
  const eventBus = useEventBus();

  const [slots, setSlots] = useState<Array<SequencerAction | undefined>>(
    () => Array.from({ length: entity.maxSlots }, () => undefined),
  );
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [attempts, setAttempts] = useState(0);
  /** Per-slot green/red indicator after a failed attempt */
  const [slotFeedback, setSlotFeedback] = useState<Array<'correct' | 'wrong' | null>>(
    () => Array.from({ length: entity.maxSlots }, () => null),
  );
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // -- Slot handlers --------------------------------------------------------

  const handleSlotPress = useCallback((index: number) => {
    if (playState === 'playing') return;
    setSelectedSlotIndex(index);
    // Clear feedback for this slot
    setSlotFeedback((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, [playState]);

  const handleActionSelect = useCallback((action: SequencerAction) => {
    if (selectedSlotIndex === null || playState === 'playing') return;

    setSlots((prev) => {
      const next = [...prev];
      next[selectedSlotIndex] = action;
      return next;
    });
    setSlotFeedback((prev) => {
      const next = [...prev];
      next[selectedSlotIndex] = null;
      return next;
    });
    setSelectedSlotIndex(null);
    eventBus.emit('UI:PLAY_SOUND', { key: 'drop_slot' });
  }, [selectedSlotIndex, playState, eventBus]);

  const handleSlotRemove = useCallback((index: number) => {
    if (playState === 'playing') return;
    setSlots((prev) => {
      const next = [...prev];
      next[index] = undefined;
      return next;
    });
    setSlotFeedback((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    eventBus.emit('UI:PLAY_SOUND', { key: 'back' });
  }, [playState, eventBus]);

  // -- Reset ----------------------------------------------------------------

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSlots(Array.from({ length: entity.maxSlots }, () => undefined));
    setPlayState('idle');
    setCurrentStep(-1);
    setAttempts(0);
    setSlotFeedback(Array.from({ length: entity.maxSlots }, () => null));
    setSelectedSlotIndex(null);
    eventBus.emit('UI:SEQUENCER_RESET');
  }, [entity.maxSlots, eventBus]);

  // -- Playback -------------------------------------------------------------

  const filledSlots = slots.filter((s): s is SequencerAction => !!s);
  const canPlay = filledSlots.length > 0 && playState === 'idle';

  const handlePlay = useCallback(() => {
    if (!canPlay) return;

    setSlotFeedback(Array.from({ length: entity.maxSlots }, () => null));
    eventBus.emit('UI:PLAY_SOUND', { key: 'confirm' });

    const sequence = slots.map((s) => s?.id || '');

    if (playEvent) {
      eventBus.emit(`UI:${playEvent}`, { sequence });
    }

    setPlayState('playing');
    setCurrentStep(0);

    let step = 0;
    const advance = () => {
      step++;
      if (step >= entity.maxSlots) {
        const playerSeq = slots.map((s) => s?.id);
        const playerIds = slots.filter(Boolean).map((s) => s?.id || '');
        const success = entity.solutions.some(
          (sol) =>
            sol.length === playerIds.length &&
            sol.every((id, i) => id === playerIds[i]),
        );

        if (success) {
          setPlayState('success');
          setCurrentStep(-1);
          eventBus.emit('UI:PLAY_SOUND', { key: 'levelComplete' });
          if (completeEvent) {
            eventBus.emit(`UI:${completeEvent}`, { success: true, sequence: playerIds });
          }
        } else {
          setAttempts((prev) => prev + 1);
          const feedback = computeSlotFeedback(playerSeq, entity.solutions);
          setSlotFeedback(feedback);
          setPlayState('idle');
          setCurrentStep(-1);
          eventBus.emit('UI:PLAY_SOUND', { key: 'fail' });
        }
      } else {
        setCurrentStep(step);
        timerRef.current = setTimeout(advance, stepDurationMs);
      }
    };
    timerRef.current = setTimeout(advance, stepDurationMs);
  }, [canPlay, slots, entity.maxSlots, entity.solutions, stepDurationMs, playEvent, completeEvent, eventBus]);

  // -- Derived display state ------------------------------------------------

  const usedIds = entity.allowDuplicates === false
    ? slots.filter(Boolean).map((s) => s?.id || '')
    : [];

  const showHint = attempts >= 3 && !!entity.hint;
  const hasFeedback = slotFeedback.some((f) => f !== null);
  const correctCount = slotFeedback.filter((f) => f === 'correct').length;
  const encourageMessage = ENCOURAGEMENT_MESSAGES[Math.min(attempts - 1, ENCOURAGEMENT_MESSAGES.length - 1)]
    ?? ENCOURAGEMENT_MESSAGES[0];

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading puzzle..." />
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

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack spacing={16}>
          {/* Title + description */}
          <VStack spacing={4}>
            <Typography variant="h4" style={{ color: '#fff' }}>
              {entity.title}
            </Typography>
            <Text style={styles.description}>{entity.description}</Text>
          </VStack>

          {/* Persistent hint after 3 failures */}
          {showHint && (
            <View style={styles.hintBox}>
              <HStack spacing={8} align="flex-start">
                <Text style={styles.hintLabel}>💡 Hint:</Text>
                <Text style={styles.hintText}>{entity.hint}</Text>
              </HStack>
            </View>
          )}

          {/* Current step indicator during playback */}
          {playState === 'playing' && currentStep >= 0 && (
            <View style={styles.playingIndicator}>
              <Text style={styles.playingText}>
                ▶ Executing step {currentStep + 1}...
              </Text>
            </View>
          )}

          {/* Sequence bar */}
          <VStack spacing={8}>
            <HStack align="center" justify="space-between">
              <Text style={styles.sectionLabel}>Your Sequence:</Text>
              {hasFeedback && playState === 'idle' && (
                <Text style={styles.scoreText}>
                  {correctCount}/{entity.maxSlots} ✅
                </Text>
              )}
            </HStack>
            <HStack spacing={8} style={styles.sequenceRow}>
              {slots.map((slot, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <Text
                      style={[
                        styles.arrow,
                        currentStep >= 0 && i <= currentStep
                          ? styles.activeArrow
                          : null,
                      ]}
                    >
                      →
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => handleSlotPress(i)}
                    style={[
                      styles.slot,
                      selectedSlotIndex === i && styles.selectedSlot,
                      slot && styles.filledSlot,
                      slotFeedback[i] === 'correct' && styles.correctSlot,
                      slotFeedback[i] === 'wrong' && styles.wrongSlot,
                      playState === 'playing' && currentStep === i && styles.activeSlot,
                    ]}
                  >
                    {slot ? (
                      <>
                        <Text style={styles.slotIcon}>
                          {slot.iconEmoji || '✦'}
                        </Text>
                        <Text style={styles.slotName} numberOfLines={1}>
                          {slot.name}
                        </Text>
                        {playState !== 'playing' && (
                          <TouchableOpacity
                            onPress={() => handleSlotRemove(i)}
                            style={styles.removeButton}
                          >
                            <Text style={styles.removeText}>×</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <Text style={styles.emptySlotText}>+</Text>
                    )}
                    <View style={styles.slotNumber}>
                      <Text style={styles.slotNumberText}>{i + 1}</Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </HStack>
          </VStack>

          {/* Action palette */}
          {playState !== 'playing' && (
            <VStack spacing={8}>
              <Text style={styles.sectionLabel}>
                {selectedSlotIndex !== null
                  ? `Select action for slot ${selectedSlotIndex + 1}:`
                  : 'Tap a slot above, then select an action:'}
              </Text>
              <HStack spacing={8} style={styles.paletteRow}>
                {entity.availableActions.map((action) => {
                  const isUsed = usedIds.includes(action.id);
                  const catColor = categoryColors?.[action.category];
                  return (
                    <TouchableOpacity
                      key={action.id}
                      onPress={() => handleActionSelect(action)}
                      disabled={isUsed}
                      style={[
                        styles.actionTile,
                        isUsed && styles.usedTile,
                        catColor && { backgroundColor: catColor.bg, borderColor: catColor.border },
                      ]}
                    >
                      <Text style={styles.actionIcon}>
                        {action.iconEmoji || '✦'}
                      </Text>
                      <Text style={[styles.actionName, isUsed && styles.usedText]}>
                        {action.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            </VStack>
          )}

          {/* Encouraging message after failure */}
          {hasFeedback && playState === 'idle' && attempts > 0 && (
            <View style={styles.encourageBox}>
              <Text style={styles.encourageText}>{encourageMessage}</Text>
            </View>
          )}

          {/* Success message */}
          {playState === 'success' && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                {entity.successMessage || '🎉 Level Complete!'}
              </Text>
            </View>
          )}

          {/* Controls */}
          <HStack spacing={8}>
            <Button
              variant="primary"
              onPress={handlePlay}
              isLoading={playState === 'playing'}
              disabled={!canPlay}
            >
              {playState === 'playing' ? 'Playing...' : '▶ Play'}
            </Button>
            <Button variant="secondary" onPress={handleReset}>
              ↺ Reset
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxHeight: 700,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  hintBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    padding: 12,
    borderRadius: 8,
  },
  hintLabel: {
    color: '#06b6d4',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  playingIndicator: {
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playingText: {
    color: '#14b8a6',
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  scoreText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  sequenceRow: {
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  arrow: {
    color: '#6b7280',
    fontSize: 16,
  },
  activeArrow: {
    color: '#14b8a6',
  },
  slot: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4b5563',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  selectedSlot: {
    borderColor: '#14b8a6',
    borderStyle: 'solid',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  filledSlot: {
    borderStyle: 'solid',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  correctSlot: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  wrongSlot: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  activeSlot: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  slotIcon: {
    fontSize: 20,
  },
  slotName: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    maxWidth: 56,
  },
  emptySlotText: {
    color: '#4b5563',
    fontSize: 24,
  },
  slotNumber: {
    position: 'absolute',
    bottom: -6,
    left: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotNumberText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  paletteRow: {
    flexWrap: 'wrap',
  },
  actionTile: {
    width: 72,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  usedTile: {
    opacity: 0.4,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionName: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  usedText: {
    color: '#6b7280',
  },
  encourageBox: {
    backgroundColor: 'rgba(202, 138, 4, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.3)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  encourageText: {
    color: '#fff',
    fontSize: 14,
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

SequencerBoard.displayName = 'SequencerBoard';
