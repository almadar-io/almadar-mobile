/**
 * ConditionalWrapper Atom Component
 *
 * A wrapper component that conditionally renders its children based on
 * condition evaluation. Used for dynamic field visibility in forms.
 * 
 * Note: S-expression evaluation requires @almadar/evaluator to be installed.
 * For now, this uses a simplified condition evaluator.
 */

import React from 'react';
import { Animated, ViewStyle } from 'react-native';

export interface ConditionalContext {
  formValues: Record<string, unknown>;
  globalVariables: Record<string, unknown>;
  localVariables?: Record<string, unknown>;
  entity?: Record<string, unknown>;
}

export type Condition = 
  | boolean 
  | string 
  | [string, string, unknown] // [operator, field, value]
  | ((context: ConditionalContext) => boolean);

export interface ConditionalWrapperProps {
  /** The condition to evaluate (boolean, expression tuple, or function) */
  condition?: Condition;
  /** Context for evaluating the condition */
  context?: ConditionalContext;
  /** Children to render when condition is true */
  children: React.ReactNode;
  /** Optional fallback to render when condition is false */
  fallback?: React.ReactNode;
  /** Whether to animate the transition */
  animate?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Simple condition evaluator
 * Supports: boolean, comparison tuples like ["=", "fieldName", "value"], or functions
 */
function evaluateCondition(
  condition: Condition, 
  context: ConditionalContext = { formValues: {}, globalVariables: {} }
): boolean {
  // Boolean condition
  if (typeof condition === 'boolean') {
    return condition;
  }

  // Function condition
  if (typeof condition === 'function') {
    return condition(context);
  }

  // Expression tuple: [operator, field, value]
  if (Array.isArray(condition) && condition.length === 3) {
    const [operator, fieldPath, expectedValue] = condition;
    
    // Parse field path (e.g., "formValues.myField" or "globalVariables.HG_VAR")
    const parts = String(fieldPath).split('.');
    let actualValue: unknown;
    
    if (parts[0] === 'formValues' && parts[1]) {
      actualValue = context.formValues?.[parts[1]];
    } else if (parts[0] === 'globalVariables' && parts[1]) {
      actualValue = context.globalVariables?.[parts[1]];
    } else if (parts[0] === 'localVariables' && parts[1]) {
      actualValue = context.localVariables?.[parts[1]];
    } else if (parts[0] && context.entity?.[parts[0]]) {
      actualValue = context.entity[parts[0]];
    }

    switch (operator) {
      case '=':
      case '==':
        return actualValue === expectedValue;
      case '!=':
        return actualValue !== expectedValue;
      case '>':
        return Number(actualValue) > Number(expectedValue);
      case '>=':
        return Number(actualValue) >= Number(expectedValue);
      case '<':
        return Number(actualValue) < Number(expectedValue);
      case '<=':
        return Number(actualValue) <= Number(expectedValue);
      case 'includes':
        return Array.isArray(actualValue) && actualValue.includes(expectedValue);
      default:
        return false;
    }
  }

  // String truthiness
  return Boolean(condition);
}

export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  context = { formValues: {}, globalVariables: {} },
  children,
  fallback = null,
  animate = false,
  style,
}) => {
  const [isVisible, setIsVisible] = React.useState(!condition ? true : false);
  const fadeAnim = React.useRef(new Animated.Value(!condition ? 1 : 0)).current;

  React.useEffect(() => {
    if (!condition) {
      setIsVisible(true);
      return;
    }

    const visible = evaluateCondition(condition, context);
    
    setIsVisible(visible);

    if (animate) {
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(visible ? 1 : 0);
    }
  }, [condition, context, animate, fadeAnim]);

  if (!condition) {
    return <>{children}</>;
  }

  if (animate) {
    return (
      <Animated.View
        style={[
          { opacity: fadeAnim, overflow: 'hidden' },
          ...(style ? [style] : []),
        ]}
      >
        {isVisible ? children : fallback}
      </Animated.View>
    );
  }

  return isVisible ? <>{children}</> : <>{fallback}</>;
};

ConditionalWrapper.displayName = 'ConditionalWrapper';
