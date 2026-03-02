/**
 * StateArchitectBoard
 *
 * State machine architect puzzle for React Native (ages 13+).
 * Kids design state machines by adding transitions between states,
 * then run tests to see if the behavior matches the puzzle goal.
 *
 * Events emitted via testEvent and completeEvent.
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { Badge } from '../../../../atoms/Badge';
import { Select } from '../../../../atoms/Select';
import { VStack, HStack } from '../../../../atoms/Stack';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';

// =============================================================================
// Types
// =============================================================================

export interface StateArchitectTransition {
  id: string;
  from: string;
  to: string;
  event: string;
  guardHint?: string;
}

export interface TestCase {
  /** Sequence of events to fire */
  events: string[];
  /** Expected final state */
  expectedState: string;
  /** Description */
  label: string;
}

export interface VariableDef {
  name: string;
  value: number | string | boolean;
  type: 'number' | 'string' | 'boolean';
}

export interface StateArchitectPuzzleEntity {
  id: string;
  title: string;
  description: string;
  hint: string;
  /** Entity being designed */
  entityName: string;
  /** Variables with initial values */
  variables: VariableDef[];
  /** States provided (kid may need to add more) */
  states: string[];
  /** Initial state */
  initialState: string;
  /** Pre-existing transitions (puzzle may have some already) */
  transitions: StateArchitectTransition[];
  /** Events available to use */
  availableEvents: string[];
  /** States available to add */
  availableStates?: string[];
  /** Test cases to validate against */
  testCases: TestCase[];
  /** Show code view toggle */
  showCodeView?: boolean;
  /** Feedback */
  successMessage?: string;
  failMessage?: string;
}

export interface StateArchitectBoardProps {
  /** Puzzle data */
  entity: StateArchitectPuzzleEntity;
  /** Playback speed */
  stepDurationMs?: number;
  /** Emits UI:{testEvent} */
  testEvent?: string;
  /** Emits UI:{completeEvent} with { success, passedTests } */
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

type PlayState = 'editing' | 'testing' | 'success' | 'fail';

interface TestResult {
  label: string;
  passed: boolean;
  actualState: string;
  expectedState: string;
}

const ENCOURAGEMENT_MESSAGES = [
  'Keep trying! Check your transitions.',
  'Almost there! Review the event flow.',
  'Don\'t give up! Trace through the events.',
];

let nextTransId = 100;

// =============================================================================
// Component
// =============================================================================

export const StateArchitectBoard: React.FC<StateArchitectBoardProps> = ({
  entity,
  stepDurationMs = 600,
  testEvent,
  completeEvent,
  style,
  isLoading,
  error,
}) => {
  useTheme();
  const eventBus = useEventBus();

  const [transitions, setTransitions] = useState<StateArchitectTransition[]>(
    entity.transitions,
  );
  const [playState, setPlayState] = useState<PlayState>('editing');
  const [currentState, setCurrentState] = useState(entity.initialState);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [addingTransition, setAddingTransition] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>(
    entity.availableEvents[0] || '',
  );
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // -- Add transition -------------------------------------------------------

  const handleAddTransition = useCallback(() => {
    if (!selectedState || !selectedTarget || !selectedEvent) return;
    if (selectedState === selectedTarget) return;

    const newTrans: StateArchitectTransition = {
      id: `t-${nextTransId++}`,
      from: selectedState,
      to: selectedTarget,
      event: selectedEvent,
    };
    setTransitions((prev) => [...prev, newTrans]);
    setAddingTransition(false);
    setSelectedTarget('');
    eventBus.emit('UI:STATE_ARCHITECT_ADD_TRANSITION', { transition: newTrans });
  }, [selectedState, selectedTarget, selectedEvent, eventBus]);

  const handleRemoveTransition = useCallback((transId: string) => {
    setTransitions((prev) => prev.filter((t) => t.id !== transId));
    eventBus.emit('UI:STATE_ARCHITECT_REMOVE_TRANSITION', { id: transId });
  }, [eventBus]);

  // -- Test runner ----------------------------------------------------------

  const handleTest = useCallback(() => {
    if (playState !== 'editing') return;
    if (testEvent) eventBus.emit(`UI:${testEvent}`, {});

    setPlayState('testing');
    setTestResults([]);

    const results: TestResult[] = [];
    let testIdx = 0;

    const runNextTest = () => {
      if (testIdx >= entity.testCases.length) {
        const allPassed = results.every((r) => r.passed);
        setPlayState(allPassed ? 'success' : 'fail');
        setTestResults(results);
        if (allPassed && completeEvent) {
          eventBus.emit(`UI:${completeEvent}`, {
            success: true,
            passedTests: results.filter((r) => r.passed).length,
          });
        }
        if (!allPassed) {
          setAttempts((prev) => prev + 1);
        }
        return;
      }

      const testCase = entity.testCases[testIdx];
      let state = entity.initialState;

      // Simulate events
      for (const evt of testCase.events) {
        const trans = transitions.find((t) => t.from === state && t.event === evt);
        if (trans) {
          state = trans.to;
        }
      }

      setCurrentState(state);
      results.push({
        label: testCase.label,
        passed: state === testCase.expectedState,
        actualState: state,
        expectedState: testCase.expectedState,
      });

      testIdx++;
      timerRef.current = setTimeout(runNextTest, stepDurationMs);
    };

    timerRef.current = setTimeout(runNextTest, stepDurationMs);
  }, [playState, transitions, entity, stepDurationMs, testEvent, completeEvent, eventBus]);

  const handleTryAgain = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlayState('editing');
    setCurrentState(entity.initialState);
    setTestResults([]);
    eventBus.emit('UI:STATE_ARCHITECT_TRY_AGAIN');
  }, [entity.initialState, eventBus]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTransitions(entity.transitions);
    setPlayState('editing');
    setCurrentState(entity.initialState);
    setTestResults([]);
    setSelectedState(null);
    setAddingTransition(false);
    setAttempts(0);
    eventBus.emit('UI:STATE_ARCHITECT_RESET');
  }, [entity, eventBus]);

  // -- Event options for Select ---------------------------------------------

  const eventOptions = useMemo(
    () =>
      entity.availableEvents.map((evt) => ({
        label: evt,
        value: evt,
      })),
    [entity.availableEvents],
  );

  const stateOptions = useMemo(
    () =>
      entity.states
        .filter((s) => s !== selectedState)
        .map((s) => ({
          label: s,
          value: s,
        })),
    [entity.states, selectedState],
  );

  // -- Code view data -------------------------------------------------------

  const codeRepresentation = useMemo(() => {
    return `machine ${entity.entityName} {
  initial: ${entity.initialState}
  
  states: ${entity.states.join(', ')}
  
  transitions:
${transitions.map((t) => `    ${t.from} --[${t.event}]--> ${t.to}`).join('\n')}
}`;
  }, [entity, transitions]);

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
          {/* Title */}
          <VStack spacing={4}>
            <Typography variant="h4" style={{ color: '#fff' }}>
              {entity.title}
            </Typography>
            <Text style={styles.description}>{entity.description}</Text>
            <View style={styles.hintBox}>
              <HStack spacing={4} align="flex-start">
                <Text style={styles.hintLabel}>Hint:</Text>
                <Text style={styles.hintText}>{entity.hint}</Text>
              </HStack>
            </View>
          </VStack>

          {/* Current State Display */}
          <View style={styles.currentStateCard}>
            <Text style={styles.currentStateLabel}>Current State</Text>
            <Text style={styles.currentStateValue}>{currentState}</Text>
            {entity.initialState === currentState && (
              <Badge size="sm" variant="secondary">
                Initial
              </Badge>
            )}
          </View>

          {/* State selector for adding transitions */}
          {playState === 'editing' && (
            <View style={styles.addTransitionCard}>
              <Text style={styles.sectionLabel}>Add Transition</Text>

              {/* Select source state */}
              <HStack spacing={8} style={styles.stateSelector}>
                {entity.states.map((state) => (
                  <TouchableOpacity
                    key={state}
                    onPress={() => {
                      setSelectedState(state);
                      setAddingTransition(true);
                    }}
                    style={[
                      styles.stateButton,
                      selectedState === state && styles.selectedStateButton,
                      currentState === state && styles.activeStateButton,
                      entity.initialState === state && styles.initialStateButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stateButtonText,
                        selectedState === state && styles.selectedStateButtonText,
                      ]}
                    >
                      {state}
                      {entity.initialState === state ? ' (initial)' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </HStack>

              {/* Transition builder */}
              {addingTransition && selectedState && (
                <VStack spacing={12} style={styles.transitionBuilder}>
                  <Text style={styles.transitionFrom}>
                    From: <Text style={styles.transitionFromState}>{selectedState}</Text>
                  </Text>

                  <HStack spacing={8} align="center">
                    <Text style={styles.transitionLabel}>Event:</Text>
                    <View style={styles.selectWrapper}>
                      <Select
                        options={eventOptions}
                        value={selectedEvent}
                        onChange={setSelectedEvent}
                      />
                    </View>
                  </HStack>

                  <HStack spacing={8} align="center">
                    <Text style={styles.transitionLabel}>To:</Text>
                    <View style={styles.selectWrapper}>
                      <Select
                        options={stateOptions}
                        value={selectedTarget}
                        onChange={setSelectedTarget}
                        placeholder="Select target state"
                      />
                    </View>
                  </HStack>

                  <Button
                    variant="primary"
                    onPress={handleAddTransition}
                    disabled={!selectedTarget}
                  >
                    Add Transition
                  </Button>
                </VStack>
              )}
            </View>
          )}

          {/* Transition list */}
          {transitions.length > 0 && (
            <View style={styles.transitionsCard}>
              <Text style={styles.sectionLabel}>
                Transitions ({transitions.length})
              </Text>
              <VStack spacing={8}>
                {transitions.map((t) => (
                  <HStack
                    key={t.id}
                    align="center"
                    style={[
                      styles.transitionRow,
                      ...(t.from === currentState ? [styles.activeTransitionRow] : []),
                    ]}
                  >
                    <Text style={styles.transitionFromText}>{t.from}</Text>
                    <Text style={styles.transitionArrow}>→</Text>
                    <View style={styles.eventBadge}>
                      <Text style={styles.eventBadgeText}>{t.event}</Text>
                    </View>
                    <Text style={styles.transitionArrow}>→</Text>
                    <Text style={styles.transitionToText}>{t.to}</Text>
                    {playState === 'editing' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveTransition(t.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </HStack>
                ))}
              </VStack>
            </View>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <View style={styles.testResultsCard}>
              <Text style={styles.sectionLabel}>Test Results</Text>
              <VStack spacing={8}>
                {testResults.map((r, i) => (
                  <HStack key={i} align="center" style={styles.testResultRow}>
                    <Text style={r.passed ? styles.passIcon : styles.failIcon}>
                      {r.passed ? '✓' : '✗'}
                    </Text>
                    <Text style={styles.testLabel}>{r.label}</Text>
                    {!r.passed && (
                      <Text style={styles.testFailDetail}>
                        Got: {r.actualState} (expected: {r.expectedState})
                      </Text>
                    )}
                  </HStack>
                ))}
              </VStack>
            </View>
          )}

          {/* Code view toggle */}
          {entity.showCodeView !== false && (
            <TouchableOpacity onPress={() => setShowCode(!showCode)}>
              <Text style={styles.codeToggle}>
                {showCode ? '▼ Hide Code' : '▶ Show Code'}
              </Text>
            </TouchableOpacity>
          )}

          {showCode && entity.showCodeView !== false && (
            <View style={styles.codeCard}>
              <Text style={styles.codeText}>{codeRepresentation}</Text>
            </View>
          )}

          {/* Result feedback */}
          {playState === 'success' && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                {entity.successMessage || '🎉 All Tests Passed!'}
              </Text>
            </View>
          )}
          {playState === 'fail' && (
            <VStack spacing={8}>
              <View style={styles.failBox}>
                <Text style={styles.failText}>
                  {ENCOURAGEMENT_MESSAGES[Math.min(attempts - 1, ENCOURAGEMENT_MESSAGES.length - 1)]}
                </Text>
              </View>
              {attempts >= 3 && entity.hint && (
                <View style={styles.hintReminder}>
                  <Text style={styles.hintReminderText}>
                    💡 Hint: {entity.hint}
                  </Text>
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
                onPress={handleTest}
                isLoading={playState === 'testing'}
                disabled={playState !== 'editing'}
              >
                {playState === 'testing' ? 'Testing...' : '▶ Run Tests'}
              </Button>
            )}
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
    maxHeight: 800,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  hintBox: {
    backgroundColor: 'rgba(202, 138, 4, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintLabel: {
    color: '#eab308',
    fontWeight: 'bold',
    fontSize: 12,
  },
  hintText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  currentStateCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  currentStateLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  currentStateValue: {
    color: '#14b8a6',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addTransitionCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  stateSelector: {
    flexWrap: 'wrap',
  },
  stateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStateButton: {
    borderColor: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
  },
  activeStateButton: {
    borderColor: '#fbbf24',
  },
  initialStateButton: {
    borderStyle: 'dashed',
    borderColor: '#6b7280',
  },
  stateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedStateButtonText: {
    fontWeight: 'bold',
  },
  transitionBuilder: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
  },
  transitionFrom: {
    color: '#9ca3af',
    fontSize: 14,
  },
  transitionFromState: {
    color: '#fff',
    fontWeight: 'bold',
  },
  transitionLabel: {
    color: '#9ca3af',
    fontSize: 14,
    width: 50,
  },
  selectWrapper: {
    flex: 1,
  },
  transitionsCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  transitionRow: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTransitionRow: {
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  transitionFromText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  transitionToText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '500',
  },
  transitionArrow: {
    color: '#6b7280',
    fontSize: 12,
  },
  eventBadge: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 'auto',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  testResultsCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  testResultRow: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  passIcon: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  failIcon: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testLabel: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  testFailDetail: {
    color: '#ef4444',
    fontSize: 10,
  },
  codeToggle: {
    color: '#14b8a6',
    fontSize: 14,
    fontWeight: '500',
  },
  codeCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 8,
  },
  codeText: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'monospace',
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
  failBox: {
    backgroundColor: 'rgba(202, 138, 4, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.3)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  failText: {
    color: '#fff',
    fontSize: 14,
  },
  hintReminder: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    padding: 12,
    borderRadius: 8,
  },
  hintReminderText: {
    color: '#fff',
    fontSize: 12,
  },
});

StateArchitectBoard.displayName = 'StateArchitectBoard';
