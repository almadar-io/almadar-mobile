import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { StatBadge, StatBadgeProps } from '../../molecules/game/StatBadge';

export interface GameHudStat extends Omit<StatBadgeProps, 'size'> {
  /** Data source entity name */
  source?: string;
  /** Field name in the source */
  field?: string;
}

/**
 * Schema-style HUD element definition.
 * Used when elements are passed from schema render_ui effects.
 */
export interface GameHudElement {
  type: string;
  bind?: string;
  position?: string;
  label?: string;
}

export interface GameHudProps {
  /** Position of the HUD */
  position?: 'top' | 'bottom' | 'corners' | string;
  /** Stats to display */
  stats?: readonly GameHudStat[];
  /** Alias for stats (schema compatibility) */
  items?: readonly GameHudStat[];
  /**
   * Schema-style elements array (alternative to stats).
   * Converted to stats internally for backwards compatibility.
   */
  elements?: readonly GameHudElement[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional styles */
  style?: ViewStyle;
  /** Whether to use a semi-transparent background */
  transparent?: boolean;
}

/**
 * Convert schema-style elements to GameHudStat format.
 */
function convertElementsToStats(
  elements: readonly GameHudElement[],
): GameHudStat[] {
  return elements.map((el) => {
    // Parse bind format: "entity.field" -> source + field
    const [source, field] = el.bind?.split('.') ?? [];

    // Map element type to stat label
    const labelMap: Record<string, string> = {
      'health-bar': 'Health',
      'score-display': 'Score',
      lives: 'Lives',
      timer: 'Time',
    };

    return {
      label: el.label || labelMap[el.type] || el.type,
      source,
      field,
    };
  });
}

export const GameHud: React.FC<GameHudProps> = ({
  position: propPosition,
  stats: propStats,
  items,
  elements,
  size = 'md',
  style,
  transparent = true,
}) => {
  // Convert elements to stats if provided, with items as alias for stats
  const stats =
    propStats ?? items ?? (elements ? convertElementsToStats(elements) : []);

  // Determine position from props or derive from elements
  const position = propPosition ?? 'corners';

  if (position === 'corners') {
    // Split stats between corners
    const leftStats = stats.slice(0, Math.ceil(stats.length / 2));
    const rightStats = stats.slice(Math.ceil(stats.length / 2));

    return (
      <View style={[styles.cornersContainer, ...(style ? [style] : [])]}>
        {/* Top-left */}
        <View style={styles.topLeft}>
          {leftStats.map((stat, i) => (
            <StatBadge key={i} {...stat} size={size} />
          ))}
        </View>

        {/* Top-right */}
        <View style={styles.topRight}>
          {rightStats.map((stat, i) => (
            <StatBadge key={i} {...stat} size={size} />
          ))}
        </View>
      </View>
    );
  }

  const positionStyle = position === 'bottom' ? styles.bottomPosition : styles.topPosition;

  return (
    <View
      style={[
        styles.container,
        positionStyle,
        transparent && styles.transparent,
        ...(style ? [style] : []),
      ]}
    >
      <View style={styles.statsRow}>
        {stats.map((stat, i) => (
          <StatBadge key={i} {...stat} size={size} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
  },
  topPosition: {
    top: 0,
  },
  bottomPosition: {
    bottom: 0,
  },
  transparent: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cornersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  topLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    gap: 8,
    pointerEvents: 'auto',
  },
  topRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
    alignItems: 'flex-end',
    pointerEvents: 'auto',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
});

GameHud.displayName = 'GameHud';
