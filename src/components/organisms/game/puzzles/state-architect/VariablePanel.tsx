import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../../../providers/ThemeContext';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { Card } from '../../../../atoms/Card';
import { Typography } from '../../../../atoms/Typography';
import { HStack, VStack } from '../../../../atoms/Stack';
import { Button } from '../../../../atoms/Button';
import { Badge } from '../../../../atoms/Badge';
import { Input } from '../../../../atoms/Input';
import { LoadingState } from '../../../../molecules/LoadingState';
import { ErrorState } from '../../../../molecules/ErrorState';
import { EmptyState } from '../../../../molecules/EmptyState';

export type VariableType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  value: unknown;
  description?: string;
  isConstant?: boolean;
  scope?: 'local' | 'global' | 'component';
}

export interface VariablePanelProps {
  /** Variables to display */
  variables: Variable[];
  /** Callback when variable value changes */
  onVariableChange?: (id: string, value: unknown) => void;
  /** Callback when variable is added */
  onVariableAdd?: (variable: Omit<Variable, 'id'>) => void;
  /** Callback when variable is deleted */
  onVariableDelete?: (id: string) => void;
  /** Style override */
  style?: ViewStyle;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Entity name for schema-driven auto-fetch */
  entity?: string;
  /** Declarative change event - emits UI:VARIABLE_CHANGE via eventBus */
  changeEvent?: string;
  /** Declarative add event - emits UI:VARIABLE_ADD via eventBus */
  addEvent?: string;
  /** Declarative delete event - emits UI:VARIABLE_DELETE via eventBus */
  deleteEvent?: string;
}

export const VariablePanel: React.FC<VariablePanelProps> = ({
  variables,
  onVariableChange,
  onVariableAdd,
  onVariableDelete,
  style,
  isLoading,
  error,
  changeEvent,
  addEvent,
  deleteEvent,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [newVariableName, setNewVariableName] = React.useState('');
  const [newVariableType, setNewVariableType] = React.useState<VariableType>('string');

  const handleVariableChange = (id: string, value: unknown) => {
    if (changeEvent) {
      eventBus.emit(`UI:${changeEvent}`, { id, value });
    }
    onVariableChange?.(id, value);
  };

  const handleAddVariable = () => {
    if (!newVariableName.trim()) return;

    const newVar: Omit<Variable, 'id'> = {
      name: newVariableName,
      type: newVariableType,
      value: getDefaultValueForType(newVariableType),
      scope: 'local',
    };

    if (addEvent) {
      eventBus.emit(`UI:${addEvent}`, { variable: newVar });
    }
    onVariableAdd?.(newVar);
    setNewVariableName('');
  };

  const handleDeleteVariable = (id: string) => {
    if (deleteEvent) {
      eventBus.emit(`UI:${deleteEvent}`, { id });
    }
    onVariableDelete?.(id);
  };

  const getDefaultValueForType = (type: VariableType): unknown => {
    switch (type) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  };

  const getTypeVariant = (
    type: VariableType
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'string':
        return 'primary';
      case 'number':
        return 'success';
      case 'boolean':
        return 'warning';
      case 'array':
        return 'secondary';
      case 'object':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderVariableValue = (variable: Variable) => {
    if (variable.isConstant) {
      return (
        <Typography variant="body" style={styles.constantValue}>
          {formatValue(variable.value)}
        </Typography>
      );
    }

    switch (variable.type) {
      case 'boolean':
        return (
          <Button
            variant={variable.value ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => handleVariableChange(variable.id, !variable.value)}
          >
            {variable.value ? 'true' : 'false'}
          </Button>
        );
      case 'string':
        return (
          <Input
            value={String(variable.value)}
            onChangeText={text => handleVariableChange(variable.id, text)}
            placeholder="Enter value..."
            style={styles.valueInput}
          />
        );
      case 'number':
        return (
          <Input
            value={String(variable.value)}
            onChangeText={text => {
              const num = parseFloat(text);
              handleVariableChange(variable.id, isNaN(num) ? 0 : num);
            }}
            keyboardType="numeric"
            placeholder="0"
            style={styles.valueInput}
          />
        );
      default:
        return (
          <Typography variant="caption" color={theme.colors['muted-foreground']}>
            {formatValue(variable.value)}
          </Typography>
        );
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (isLoading) {
    return (
      <Card style={[styles.container, ...(style ? [style] : [])]}>
        <LoadingState message="Loading variables..." />
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
      <VStack spacing={16}>
        <Typography variant="h4">Variables</Typography>

        {/* Add new variable */}
        {(addEvent || onVariableAdd) && (
          <VStack spacing={8}>
            <Typography variant="label">Add Variable</Typography>
            <HStack spacing={8}>
              <Input
                value={newVariableName}
                onChangeText={setNewVariableName}
                placeholder="Variable name"
                style={styles.nameInput}
              />
              <Button
                variant={newVariableType === 'string' ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setNewVariableType('string')}
              >
                str
              </Button>
              <Button
                variant={newVariableType === 'number' ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setNewVariableType('number')}
              >
                num
              </Button>
              <Button
                variant={newVariableType === 'boolean' ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setNewVariableType('boolean')}
              >
                bool
              </Button>
            </HStack>
            <Button variant="primary" size="sm" onPress={handleAddVariable}>
              Add Variable
            </Button>
          </VStack>
        )}

        {/* Variable list */}
        {variables.length === 0 ? (
          <EmptyState message="No variables defined" />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.variableList}>
            <VStack spacing={8}>
              {variables.map(variable => (
                <View
                  key={variable.id}
                  style={[styles.variableItem, { borderBottomColor: theme.colors.border }]}
                >
                  <HStack justify="space-between" align="center">
                    <VStack spacing={4} style={styles.variableInfo}>
                      <HStack spacing={8} align="center">
                        <Typography variant="body" style={styles.variableName}>
                          {variable.isConstant && '🔒 '}
                          {variable.name}
                        </Typography>
                        <Badge variant={getTypeVariant(variable.type)} size="sm">
                          {variable.type}
                        </Badge>
                        {variable.scope && variable.scope !== 'local' && (
                          <Badge variant="secondary" size="sm">
                            {variable.scope}
                          </Badge>
                        )}
                      </HStack>
                      {variable.description && (
                        <Typography variant="caption" color={theme.colors['muted-foreground']}>
                          {variable.description}
                        </Typography>
                      )}
                    </VStack>
                    <HStack spacing={8} align="center">
                      {renderVariableValue(variable)}
                      {(deleteEvent || onVariableDelete) && !variable.isConstant && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => handleDeleteVariable(variable.id)}
                        >
                          🗑️
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </View>
              ))}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  nameInput: {
    flex: 1,
  },
  valueInput: {
    width: 120,
  },
  variableList: {
    maxHeight: 350,
  },
  variableItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  variableInfo: {
    flex: 1,
  },
  variableName: {
    fontFamily: 'monospace',
  },
  constantValue: {
    fontFamily: 'monospace',
    opacity: 0.7,
  },
});

VariablePanel.displayName = 'VariablePanel';
