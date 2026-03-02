import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
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

export interface StateNode {
  id: string;
  name: string;
  type: 'initial' | 'state' | 'final';
  description?: string;
  actions?: string[];
}

export interface StateTransition {
  id: string;
  from: string;
  to: string;
  event: string;
  condition?: string;
}

export interface StateMachine {
  id: string;
  name: string;
  states: StateNode[];
  transitions: StateTransition[];
  currentState?: string;
}

export interface StateMachineViewProps {
  /** State machine to visualize */
  stateMachine: StateMachine;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative state click event - emits UI:STATE_CLICK via eventBus */
  stateClickEvent?: string;
  /** Declarative transition click event - emits UI:TRANSITION_CLICK via eventBus */
  transitionClickEvent?: string;
}

export const StateMachineView: React.FC<StateMachineViewProps> = ({
  stateMachine,
  style,
  isLoading,
  error,
  stateClickEvent,
  transitionClickEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handleStateClick = (stateId: string) => {
    if (stateClickEvent) {
      eventBus.emit(`UI:${stateClickEvent}`, { stateId, stateMachine });
    }
  };

  const handleTransitionClick = (transitionId: string) => {
    if (transitionClickEvent) {
      eventBus.emit(`UI:${transitionClickEvent}`, { transitionId, stateMachine });
    }
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading state machine..." />
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

  if (!stateMachine.states.length) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <EmptyState message="No states defined" />
      </Card>
    );
  }

  const getStateVariant = (
    state: StateNode
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    if (stateMachine.currentState === state.id) return 'primary';
    if (state.type === 'initial') return 'success';
    if (state.type === 'final') return 'secondary';
    return 'default';
  };

  const getTransitionsForState = (stateId: string): StateTransition[] => {
    return stateMachine.transitions.filter(t => t.from === stateId);
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        <HStack justify="space-between" align="center">
          <Typography variant="h3">{stateMachine.name}</Typography>
          {stateMachine.currentState && (
            <Badge variant="primary">Current: {stateMachine.currentState}</Badge>
          )}
        </HStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack spacing={16}>
            {/* States */}
            <VStack spacing={12}>
              <Typography variant="h4">States</Typography>
              {stateMachine.states.map(state => (
                <Button
                  key={state.id}
                  variant="ghost"
                  onPress={() => handleStateClick(state.id)}
                  style={{
                    ...styles.stateCard,
                    ...(stateMachine.currentState === state.id
                      ? {
                          backgroundColor: `${theme.colors.primary}20`,
                          borderColor: theme.colors.primary,
                          borderWidth: 2,
                        }
                      : {}),
                  }}
                >
                  <VStack spacing={8} style={styles.stateContent}>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={8} align="center">
                        <Typography variant="h4">{state.name}</Typography>
                        <Badge variant={getStateVariant(state)} size="sm">
                          {state.type}
                        </Badge>
                      </HStack>
                      {stateMachine.currentState === state.id && (
                        <View
                          style={[
                            styles.currentIndicator,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        />
                      )}
                    </HStack>

                    {state.description && (
                      <Typography variant="caption" color={theme.colors['muted-foreground']}>
                        {state.description}
                      </Typography>
                    )}

                    {state.actions && state.actions.length > 0 && (
                      <HStack spacing={4} style={styles.actions}>
                        {state.actions.map((action, index) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {action}
                          </Badge>
                        ))}
                      </HStack>
                    )}

                    {/* Transitions from this state */}
                    {(() => {
                      const transitions = getTransitionsForState(state.id);
                      if (transitions.length === 0) return null;
                      return (
                        <VStack spacing={4} style={styles.transitions}>
                          <Typography variant="label">Transitions:</Typography>
                          {transitions.map(transition => (
                            <Button
                              key={transition.id}
                              variant="ghost"
                              size="sm"
                              onPress={() => handleTransitionClick(transition.id)}
                              style={styles.transitionItem}
                            >
                              <HStack spacing={8} align="center">
                                <Typography variant="caption">
                                  {transition.event} →{' '}
                                  {stateMachine.states.find(s => s.id === transition.to)?.name}
                                </Typography>
                                {transition.condition && (
                                  <Badge variant="secondary" size="sm">
                                    if {transition.condition}
                                  </Badge>
                                )}
                              </HStack>
                            </Button>
                          ))}
                        </VStack>
                      );
                    })()}
                  </VStack>
                </Button>
              ))}
            </VStack>
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
  stateCard: {
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 12,
  },
  stateContent: {
    alignItems: 'flex-start',
  },
  currentIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actions: {
    flexWrap: 'wrap',
  },
  transitions: {
    marginTop: 8,
  },
  transitionItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

StateMachineView.displayName = 'StateMachineView';
