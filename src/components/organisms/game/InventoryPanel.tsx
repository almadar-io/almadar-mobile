import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';


export interface InventoryItem {
  id: string;
  type: string;
  quantity: number;
  sprite?: string;
  name?: string;
  description?: string;
}

export interface InventoryPanelProps {
  /** Array of items in inventory */
  items: InventoryItem[];
  /** Total number of slots */
  slots: number;
  /** Number of columns in grid */
  columns: number;
  /** Currently selected slot index */
  selectedSlot?: number;
  /** Called when a slot is selected */
  onSelectSlot?: (index: number) => void;
  /** Called when an item is used (double-tap or confirm) */
  onUseItem?: (item: InventoryItem) => void;
  /** Called when an item is dropped */
  onDropItem?: (item: InventoryItem) => void;
  /** Declarative event: emits UI:{selectSlotEvent} with { index } when a slot is selected */
  selectSlotEvent?: string;
  /** Declarative event: emits UI:{useItemEvent} with { item } when an item is used */
  useItemEvent?: string;
  /** Declarative event: emits UI:{dropItemEvent} with { item } when an item is dropped */
  dropItemEvent?: string;
  /** Show item tooltips on long press */
  showTooltips?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  slots,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  columns,
  selectedSlot,
  onSelectSlot,
  onUseItem,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDropItem,
  selectSlotEvent,
  useItemEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dropItemEvent,
  showTooltips = true,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  const handleSlotPress = useCallback((index: number) => {
    const now = Date.now();
    const item = items.find(i => i.id === String(index));
    
    // Double tap detection
    if (lastTap && now - lastTap < 300 && item) {
      // Double tap - use item
      if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
      onUseItem?.(item);
      setLastTap(null);
      return;
    }
    
    setLastTap(now);
    
    // Single tap - select slot
    if (selectSlotEvent) eventBus.emit(`UI:${selectSlotEvent}`, { index });
    onSelectSlot?.(index);
  }, [lastTap, items, onSelectSlot, onUseItem, selectSlotEvent, useItemEvent, eventBus]);

  const handleLongPress = useCallback((index: number) => {
    if (!showTooltips) return;
    setShowTooltip(index);
  }, [showTooltips]);

  // Drop handler - preserved for future use
  // const handleDrop = useCallback((item: InventoryItem) => {
  //   if (dropItemEvent) eventBus.emit(`UI:${dropItemEvent}`, { item });
  //   onDropItem?.(item);
  // }, [onDropItem, dropItemEvent, eventBus]);

  // Generate slots array
  const slotsArray = Array.from({ length: slots }, (_, i) => {
    const item = items.find(item => item.id === String(i));
    return { index: i, item };
  });

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <View style={styles.grid}>
        {slotsArray.map(({ index, item }) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSlotPress(index)}
            onLongPress={() => handleLongPress(index)}
            onPressOut={() => setShowTooltip(null)}
            style={[
              styles.slot,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
              },
              selectedSlot === index && {
                borderColor: theme.colors.primary,
                borderWidth: 2,
              },
            ]}
          >
            {item ? (
              <>
                <Text style={styles.itemIcon}>
                  {item.sprite || '📦'}
                </Text>
                {item.quantity > 1 && (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </View>
                )}
                
                {/* Tooltip */}
                {showTooltip === index && item.name && (
                  <View style={styles.tooltip}>
                    <Typography variant="caption" style={{ color: '#fff' }}>
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography variant="caption" style={{ color: '#aaa', fontSize: 10 }}>
                        {item.description}
                      </Typography>
                    )}
                  </View>
                )}
              </>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemIcon: {
    fontSize: 32,
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#374151',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 8,
    borderRadius: 4,
    minWidth: 120,
    zIndex: 100,
  },
});

InventoryPanel.displayName = 'InventoryPanel';
