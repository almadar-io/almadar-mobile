/**
 * ObjectRulePanel Component
 *
 * Shows the rules panel for a selected world object in the Event Handler tier.
 * Displays object info, its current state (via TraitStateViewer), and
 * a list of WHEN/THEN rules the kid has set.
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { Typography } from '../../../../atoms/Typography';
import { Button } from '../../../../atoms/Button';
import { VStack, HStack } from '../../../../atoms/Stack';
import { Card } from '../../../../atoms/Card';
import { RuleEditor, RuleDefinition } from './RuleEditor';

export interface PuzzleObjectDef {
  id: string;
  name: string;
  icon: string;
  states: string[];
  initialState: string;
  currentState: string;
  availableEvents: Array<{ value: string; label: string }>;
  availableActions: Array<{ value: string; label: string }>;
  rules: RuleDefinition[];
  /** Max rules allowed on this object */
  maxRules?: number;
}

export interface ObjectRulePanelProps {
  /** The selected object */
  object: PuzzleObjectDef;
  /** Called when rules change */
  onRulesChange: (objectId: string, rules: RuleDefinition[]) => void;
  /** Whether editing is disabled */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

let nextRuleId = 1;

export const ObjectRulePanel: React.FC<ObjectRulePanelProps> = ({
  object,
  onRulesChange,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const maxRules = object.maxRules || 3;
  const canAdd = object.rules.length < maxRules;

  const handleRuleChange = useCallback((index: number, updatedRule: RuleDefinition) => {
    const newRules = [...object.rules];
    newRules[index] = updatedRule;
    onRulesChange(object.id, newRules);
  }, [object.id, object.rules, onRulesChange]);

  const handleRuleRemove = useCallback((index: number) => {
    const newRules = object.rules.filter((_, i) => i !== index);
    onRulesChange(object.id, newRules);
  }, [object.id, object.rules, onRulesChange]);

  const handleAddRule = useCallback(() => {
    if (!canAdd || disabled) return;
    const firstEvent = object.availableEvents[0]?.value || '';
    const firstAction = object.availableActions[0]?.value || '';
    const newRule: RuleDefinition = {
      id: `rule-${nextRuleId++}`,
      whenEvent: firstEvent,
      thenAction: firstAction,
    };
    onRulesChange(object.id, [...object.rules, newRule]);
  }, [canAdd, disabled, object, onRulesChange]);

  return (
    <Card style={style ? [styles.container, style] : styles.container}>
      <VStack spacing={16}>
        {/* Object header */}
        <HStack spacing={12} align="center">
          <Typography variant="h4">{object.icon}</Typography>
          <VStack spacing={4}>
            <Typography variant="body" style={{ fontWeight: '600' }}>
              {object.name}
            </Typography>
            <Typography variant="caption" style={{ color: theme.colors['muted-foreground'] }}>
              State: {object.currentState}
            </Typography>
          </VStack>
        </HStack>

        {/* Rules */}
        <VStack spacing={8}>
          <Typography variant="body" style={{ color: theme.colors['muted-foreground'], fontWeight: '500' }}>
            Rules ({object.rules.length}/{maxRules}):
          </Typography>
          {object.rules.map((rule, index) => (
            <RuleEditor
              key={rule.id}
              rule={rule}
              availableEvents={object.availableEvents}
              availableActions={object.availableActions}
              onChange={(r) => handleRuleChange(index, r)}
              onRemove={() => handleRuleRemove(index)}
              disabled={disabled}
            />
          ))}
          {canAdd && !disabled && (
            <Button variant="ghost" onPress={handleAddRule} style={styles.addButton}>
              + Add Rule
            </Button>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  addButton: {
    alignSelf: 'flex-start' as const,
  },
});

ObjectRulePanel.displayName = 'ObjectRulePanel';
