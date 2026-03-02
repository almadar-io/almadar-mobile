import React from 'react';
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
import { VStack, HStack } from '../../atoms/Stack';

export interface BattleUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp?: number;
  maxMp?: number;
  level?: number;
  avatar?: string;
  isPlayer?: boolean;
  isDead?: boolean;
  status?: string[];
}

export interface BattleBoardProps {
  /** Units on the battlefield */
  units: BattleUnit[];
  /** Currently active unit ID */
  activeUnitId?: string;
  /** Selected unit ID */
  selectedUnitId?: string;
  /** Turn number */
  turn?: number;
  /** Available actions for active unit */
  actions?: string[];
  /** Callback when unit is selected */
  onSelectUnit?: (unitId: string) => void;
  /** Callback when action is selected */
  onAction?: (action: string) => void;
  /** Event names */
  selectUnitEvent?: string;
  actionEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const BattleBoard: React.FC<BattleBoardProps> = ({
  units,
  activeUnitId,
  selectedUnitId,
  turn = 1,
  actions = [],
  onSelectUnit,
  onAction,
  selectUnitEvent,
  actionEvent,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();

  const handleSelectUnit = (unitId: string) => {
    if (selectUnitEvent) eventBus.emit(`UI:${selectUnitEvent}`, { unitId });
    onSelectUnit?.(unitId);
  };

  const handleAction = (action: string) => {
    if (actionEvent) eventBus.emit(`UI:${actionEvent}`, { action });
    onAction?.(action);
  };

  const playerUnits = units.filter(u => u.isPlayer);
  const enemyUnits = units.filter(u => !u.isPlayer);

  const renderUnit = (unit: BattleUnit) => {
    const isActive = unit.id === activeUnitId;
    const isSelected = unit.id === selectedUnitId;
    const hpPercent = (unit.hp / unit.maxHp) * 100;

    return (
      <TouchableOpacity
        key={unit.id}
        onPress={() => handleSelectUnit(unit.id)}
        style={[
          styles.unitCard,
          {
            backgroundColor: unit.isDead ? '#374151' : '#1f2937',
            borderColor: isActive ? '#fbbf24' : isSelected ? '#3b82f6' : '#4b5563',
            borderWidth: isActive ? 2 : isSelected ? 2 : 1,
            opacity: unit.isDead ? 0.6 : 1,
          },
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {unit.avatar || (unit.isPlayer ? '🧙' : '👹')}
          </Text>
        </View>
        
        <VStack spacing={4} style={styles.unitInfo}>
          <Text style={styles.unitName} numberOfLines={1}>
            {unit.name}
          </Text>
          
          {/* HP Bar */}
          <View style={styles.barContainer}>
            <View style={[styles.hpBar, { width: `${hpPercent}%` }]} />
          </View>
          
          <Text style={styles.hpText}>
            {unit.hp}/{unit.maxHp} HP
          </Text>
          
          {unit.mp !== undefined && unit.maxMp !== undefined && (
            <>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.mpBar, 
                    { width: `${(unit.mp / unit.maxMp) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.mpText}>
                {unit.mp}/{unit.maxMp} MP
              </Text>
            </>
          )}
          
          {unit.status && unit.status.length > 0 && (
            <HStack spacing={4} style={styles.statusContainer}>
              {unit.status.map((s, i) => (
                <Text key={i} style={styles.statusBadge}>{s}</Text>
              ))}
            </HStack>
          )}
        </VStack>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        {/* Turn indicator */}
        <View style={styles.turnBar}>
          <Typography variant="h4" style={{ color: '#fbbf24' }}>
            TURN {turn}
          </Typography>
          {activeUnitId && (
            <Text style={styles.activeText}>
              Active: {units.find(u => u.id === activeUnitId)?.name}
            </Text>
          )}
        </View>

        {/* Battlefield */}
        <View style={styles.battlefield}>
          {/* Player side */}
          <VStack spacing={8} style={styles.side}>
            <Text style={styles.sideLabel}>ALLIES</Text>
            {playerUnits.map(renderUnit)}
          </VStack>

          <View style={styles.vsDivider}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Enemy side */}
          <VStack spacing={8} style={styles.side}>
            <Text style={styles.sideLabel}>ENEMIES</Text>
            {enemyUnits.map(renderUnit)}
          </VStack>
        </View>

        {/* Action bar */}
        {actions.length > 0 && (
          <View style={styles.actionBar}>
            <HStack spacing={8} style={styles.actionContainer}>
              {actions.map(action => (
                <TouchableOpacity
                  key={action}
                  onPress={() => handleAction(action)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>{action.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </HStack>
          </View>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  turnBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  activeText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  battlefield: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  side: {
    flex: 1,
  },
  sideLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  vsDivider: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '800',
  },
  unitCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  barContainer: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBar: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  mpBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  hpText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  mpText: {
    color: '#6b7280',
    fontSize: 10,
  },
  statusContainer: {
    flexWrap: 'wrap',
  },
  statusBadge: {
    backgroundColor: '#6b7280',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionBar: {
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  actionContainer: {
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

BattleBoard.displayName = 'BattleBoard';
