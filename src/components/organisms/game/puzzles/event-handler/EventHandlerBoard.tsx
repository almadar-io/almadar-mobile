/**
 * EventHandlerBoard Organism
 *
 * Contains ALL game logic for the Event Handler tier (ages 9-12).
 * Kids click on world objects, set WHEN/THEN rules, and watch
 * event chains cascade during playback.
 *
 * Encourages experimentation: on failure, resets to editing so the kid
 * can try different rules. After 3 failures, shows a progressive hint.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Typography } from '../../../../atoms/Typography';
import { Button } from '../../../../atoms/Button';
import { VStack, HStack } from '../../../../atoms/Stack';

import { Badge } from '../../../../atoms/Badge';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';
import { ObjectRulePanel, PuzzleObjectDef } from './ObjectRulePanel';
import { EventLog, EventLogEntry } from './EventLog';
import { RuleDefinition } from './RuleEditor';

// =============================================================================
// Types
// =============================================================================

export interface EventHandlerPuzzleEntity {
  id: string;
  title: string;
  description: string;
  /** Objects the kid can configure */
  objects: PuzzleObjectDef[];
  /** Goal condition description */
  goalCondition: string;
  /** Event that represents goal completion */
  goalEvent: string;
  /** Sequence of events that auto-fire to start the simulation */
  triggerEvents?: string[];
  /** Feedback */
  successMessage?: string;
  failMessage?: string;
  /** Progressive hint shown after 3 failures */
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface EventHandlerBoardProps {
  /** Puzzle data */
  entity: EventHandlerPuzzleEntity;
  /** Playback speed in ms per event */
  stepDurationMs?: number;
  /** Emits UI:{playEvent} */
  playEvent?: string;
  /** Emits UI:{completeEvent} with { success } */
  completeEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
}

type PlayState = 'editing' | 'playing' | 'success' | 'fail';

const ENCOURAGEMENT_MESSAGES = [
  'Not quite! Try a different combination.',
  'Keep experimenting! You\'re getting closer.',
  'Don\'t give up! Think about the event chain.',
];

// =============================================================================
// Component
// =============================================================================

export const EventHandlerBoard: React.FC<EventHandlerBoardProps> = ({
  entity,
  stepDurationMs = 800,
  playEvent,
  completeEvent,
  style,
  isLoading,
  error,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const [objects, setObjects] = useState<PuzzleObjectDef[]>(entity.objects);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
    entity.objects[0]?.id || null,
  );
  const [playState, setPlayState] = useState<PlayState>('editing');
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logIdCounter = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;

  // -- Rule changes ---------------------------------------------------------

  const handleRulesChange = useCallback((objectId: string, rules: RuleDefinition[]) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === objectId ? { ...o, rules } : o)),
    );
  }, []);

  // -- Add log entry --------------------------------------------------------

  const addLogEntry = useCallback((icon: string, message: string, status: EventLogEntry['status'] = 'done') => {
    const id = `log-${logIdCounter.current++}`;
    setEventLog((prev) => [...prev, { id, timestamp: Date.now(), icon, message, status }]);
  }, []);

  // -- Playback: simulate event chain ---------------------------------------

  const handlePlay = useCallback(() => {
    if (playState !== 'editing') return;
    if (playEvent) eventBus.emit(`UI:${playEvent}`, {});

    setPlayState('playing');
    setEventLog([]);

    const allRules: Array<{ object: PuzzleObjectDef; rule: RuleDefinition }> = [];
    objects.forEach((obj) => {
      obj.rules.forEach((rule) => {
        allRules.push({ object: obj, rule });
      });
    });

    const triggers = entity.triggerEvents || [];
    const eventQueue = [...triggers];
    const firedEvents = new Set<string>();
    let stepIdx = 0;
    let goalReached = false;

    const processNext = () => {
      if (eventQueue.length === 0 || stepIdx > 20) {
        if (goalReached) {
          setPlayState('success');
          if (completeEvent) {
            eventBus.emit(`UI:${completeEvent}`, { success: true });
          }
        } else {
          setAttempts((prev) => prev + 1);
          setPlayState('fail');
          // Do NOT emit PUZZLE_COMPLETE on failure — kid keeps trying
        }
        return;
      }

      const currentEvent = eventQueue.shift();
      if (!currentEvent) return;

      if (firedEvents.has(currentEvent)) {
        timerRef.current = setTimeout(processNext, 100);
        return;
      }
      firedEvents.add(currentEvent);

      const matching = allRules.filter((r) => r.rule.whenEvent === currentEvent);

      if (matching.length === 0) {
        addLogEntry('⚡', `No listeners for "${currentEvent}"`, 'done');
      } else {
        matching.forEach(({ object, rule }) => {
          addLogEntry(
            object.icon,
            `${object.name} heard "${currentEvent}" → ${rule.thenAction}`,
            'done',
          );
          eventQueue.push(rule.thenAction);
          if (rule.thenAction === entity.goalEvent) {
            goalReached = true;
          }
        });
      }

      if (currentEvent === entity.goalEvent) {
        goalReached = true;
      }

      stepIdx++;
      timerRef.current = setTimeout(processNext, stepDurationMs);
    };

    if (triggers.length > 0) {
      addLogEntry(
        '🎬',
        `Simulation started with: ${triggers.join(', ')}`,
        'active',
      );
    }
    timerRef.current = setTimeout(processNext, stepDurationMs);
  }, [playState, objects, entity, stepDurationMs, playEvent, completeEvent, eventBus, addLogEntry]);

  const handleTryAgain = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Keep the rules the kid set — just reset play state so they can tweak
    setPlayState('editing');
    setEventLog([]);
  }, []);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setObjects(entity.objects);
    setPlayState('editing');
    setEventLog([]);
    setSelectedObjectId(entity.objects[0]?.id || null);
    setAttempts(0);
  }, [entity.objects]);

  const showHint = attempts >= 3 && entity.hint;
  const encourageMessage = ENCOURAGEMENT_MESSAGES[Math.min(attempts - 1, ENCOURAGEMENT_MESSAGES.length - 1)]
    ?? ENCOURAGEMENT_MESSAGES[0];

  if (isLoading) {
    return <LoadingState message="Loading puzzle..." />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <ScrollView style={[styles.container, style]}>
      <VStack spacing={16} style={styles.content}>
        {/* Title + goal */}
        <VStack spacing={8}>
          <Typography variant="h4">{entity.title}</Typography>
          <Typography variant="body">{entity.description}</Typography>
          <View style={[styles.goalBox, { backgroundColor: `${theme.colors.primary}10`, borderColor: `${theme.colors.primary}30` }]}>
            <HStack spacing={8} align="center">
              <Typography variant="caption" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                GOAL:
              </Typography>
              <Typography variant="caption">{entity.goalCondition}</Typography>
            </HStack>
          </View>
        </VStack>

        {/* Object selectors */}
        <VStack spacing={8}>
          <Typography variant="body" style={{ color: theme.colors['muted-foreground'], fontWeight: '500' }}>
            Click an object to configure:
          </Typography>
          <HStack spacing={8} style={styles.wrap}>
            {objects.map((obj) => (
              <TouchableOpacity
                key={obj.id}
                onPress={() => setSelectedObjectId(obj.id)}
                style={[
                  styles.objectButton,
                  {
                    borderColor:
                      selectedObjectId === obj.id
                        ? theme.colors.primary
                        : theme.colors.border,
                    backgroundColor:
                      selectedObjectId === obj.id
                        ? `${theme.colors.primary}10`
                        : theme.colors.card,
                  },
                ]}
              >
                <VStack spacing={4} align="center" style={styles.objectContent}>
                  <Typography variant="h4">{obj.icon}</Typography>
                  <Typography variant="body" style={{ fontWeight: '500' }}>
                    {obj.name}
                  </Typography>
                  <Badge variant="default" size="sm">
                    {obj.currentState}
                  </Badge>
                </VStack>
              </TouchableOpacity>
            ))}
          </HStack>
        </VStack>

        {/* Selected object rule panel */}
        {selectedObject && (
          <ObjectRulePanel
            object={selectedObject}
            onRulesChange={handleRulesChange}
            disabled={playState !== 'editing'}
          />
        )}

        {/* Event log during playback */}
        {eventLog.length > 0 && <EventLog entries={eventLog} />}

        {/* Result feedback */}
        {playState === 'success' && (
          <View style={[styles.resultBox, { backgroundColor: `${theme.colors.success}20`, borderColor: theme.colors.success }]}>
            <Typography variant="h4" style={{ color: theme.colors.success, textAlign: 'center' }}>
              ✅ {entity.successMessage || 'Event chain complete!'}
            </Typography>
          </View>
        )}

        {playState === 'fail' && (
          <VStack spacing={12}>
            <View style={[styles.resultBox, { backgroundColor: `${theme.colors.warning}10`, borderColor: `${theme.colors.warning}30` }]}>
              <Typography variant="body" style={{ fontWeight: '500', textAlign: 'center' }}>
                {encourageMessage}
              </Typography>
            </View>
            {showHint && (
              <View style={[styles.hintBox, { backgroundColor: `${theme.colors.accent}10`, borderColor: `${theme.colors.accent}30` }]}>
                <HStack spacing={8} align="flex-start">
                  <Typography variant="body" style={{ color: theme.colors.accent, fontWeight: '700' }}>
                    💡 HINT:
                  </Typography>
                  <Typography variant="body">{entity.hint}</Typography>
                </HStack>
              </View>
            )}
          </VStack>
        )}

        {/* Controls */}
        <HStack spacing={8}>
          {playState === 'fail' ? (
            <Button variant="primary" onPress={handleTryAgain}>
              🔄 Try Again
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={handlePlay}
              disabled={playState !== 'editing'}
            >
              ▶ Play
            </Button>
          )}
          <Button variant="ghost" onPress={handleReset}>
            ↺ Reset
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
  goalBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  objectButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  objectContent: {
    minWidth: 100,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  hintBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});

EventHandlerBoard.displayName = 'EventHandlerBoard';
