/**
 * RuleEditor Component
 *
 * A single WHEN/THEN rule row for the Event Handler tier (ages 9-12) on React Native.
 * Kid picks an event trigger and an action from dropdowns.
 *
 * @packageDocumentation
 */

import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { HStack } from '../../../../atoms/Stack';
import { Select } from '../../../../atoms/Select';
import { Typography } from '../../../../atoms/Typography';

export interface RuleDefinition {
  id: string;
  whenEvent: string;
  thenAction: string;
}

export interface RuleEditorProps {
  /** The current rule */
  rule: RuleDefinition;
  /** Available event triggers to listen for */
  availableEvents: Array<{ value: string; label: string }>;
  /** Available actions to perform */
  availableActions: Array<{ value: string; label: string }>;
  /** Called when rule changes */
  onChange: (rule: RuleDefinition) => void;
  /** Called when rule is removed */
  onRemove?: () => void;
  /** Whether editing is disabled (during playback) */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({
  rule,
  availableEvents,
  availableActions,
  onChange,
  onRemove,
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  const handleWhenChange = useCallback((value: string) => {
    onChange({ ...rule, whenEvent: value });
  }, [rule, onChange]);

  const handleThenChange = useCallback((value: string) => {
    onChange({ ...rule, thenAction: value });
  }, [rule, onChange]);

  return (
    <View style={[styles.container, style]}>
      <HStack spacing={8} align="center" style={styles.row}>
        <Typography variant="caption" style={[styles.label, { color: theme.colors.primary }]}>
          WHEN
        </Typography>
        <View style={styles.selectContainer}>
          <Select
            value={rule.whenEvent}
            onChange={handleWhenChange}
            options={availableEvents}
            disabled={disabled}
          />
        </View>
        <Typography variant="caption" style={[styles.label, { color: theme.colors.accent }]}>
          → THEN
        </Typography>
        <View style={styles.selectContainer}>
          <Select
            value={rule.thenAction}
            onChange={handleThenChange}
            options={availableActions}
            disabled={disabled}
          />
        </View>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} disabled={disabled}>
            <Typography variant="body" style={{ color: theme.colors.error }}>
              ✕
            </Typography>
          </TouchableOpacity>
        )}
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '600',
  },
  selectContainer: {
    flex: 1,
    minWidth: 100,
  },
});

RuleEditor.displayName = 'RuleEditor';
