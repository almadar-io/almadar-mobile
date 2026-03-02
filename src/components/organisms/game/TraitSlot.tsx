import React from 'react';
import { 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';

export interface TraitSlotProps {
  /** Slot position/index */
  slotIndex: number;
  /** Whether slot is filled */
  filled?: boolean;
  /** Trait name if filled */
  traitName?: string;
  /** Trait icon/emoji */
  traitIcon?: string;
  /** Whether this slot is locked (needs level unlock) */
  locked?: boolean;
  /** Level required to unlock */
  unlockLevel?: number;
  /** Whether slot is active/selected */
  active?: boolean;
  /** Callback when slot is pressed */
  onPress?: (slotIndex: number) => void;
  /** Callback when slot is long pressed (for unequip) */
  onLongPress?: (slotIndex: number) => void;
  /** Event names */
  equipEvent?: string;
  unequipEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const TraitSlot: React.FC<TraitSlotProps> = ({
  slotIndex,
  filled = false,
  traitName,
  traitIcon,
  locked = false,
  unlockLevel,
  active = false,
  onPress,
  onLongPress,
  equipEvent,
  unequipEvent,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();

  const handlePress = () => {
    if (locked) return;
    
    if (filled && unequipEvent) {
      eventBus.emit(`UI:${unequipEvent}`, { slotIndex });
    } else if (!filled && equipEvent) {
      eventBus.emit(`UI:${equipEvent}`, { slotIndex });
    }
    
    onPress?.(slotIndex);
  };

  const handleLongPress = () => {
    if (!filled || locked) return;
    
    if (unequipEvent) {
      eventBus.emit(`UI:${unequipEvent}`, { slotIndex, traitName });
    }
    onLongPress?.(slotIndex);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={locked}
      style={[
        styles.container,
        {
          borderColor: active 
            ? theme.colors.primary 
            : filled 
              ? '#22c55e' 
              : locked 
                ? '#374151' 
                : '#4b5563',
          backgroundColor: filled 
            ? 'rgba(34, 197, 94, 0.1)' 
            : locked 
              ? '#1f2937' 
              : '#111827',
          opacity: locked ? 0.5 : 1,
        },
        ...(style ? [style] : []),
      ]}
    >
      {locked ? (
        <>
          <Text style={styles.lockIcon}>🔒</Text>
          {unlockLevel && (
            <Text style={styles.unlockText}>Lv.{unlockLevel}</Text>
          )}
        </>
      ) : filled ? (
        <>
          <Text style={styles.traitIcon}>{traitIcon || '✦'}</Text>
          <Text style={styles.traitName} numberOfLines={1}>
            {traitName}
          </Text>
          <Text style={styles.hint}>Long press to remove</Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyIcon}>+</Text>
          <Text style={styles.emptyText}>Empty Slot</Text>
          <Text style={styles.slotNumber}>Slot {slotIndex + 1}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  lockIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  unlockText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  traitIcon: {
    fontSize: 28,
  },
  traitName: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 70,
  },
  hint: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyIcon: {
    fontSize: 32,
    color: '#4b5563',
  },
  emptyText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  slotNumber: {
    fontSize: 9,
    color: '#374151',
    marginTop: 2,
  },
});

TraitSlot.displayName = 'TraitSlot';
