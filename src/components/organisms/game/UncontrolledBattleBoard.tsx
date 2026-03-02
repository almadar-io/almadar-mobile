import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';
import { VStack, HStack } from '../../atoms/Stack';
import { Button } from '../../atoms/Button';

export interface UncontrolledUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
  isDead?: boolean;
}

export interface UncontrolledBattleBoardProps {
  /** Initial player units */
  initialPlayerUnits: UncontrolledUnit[];
  /** Initial enemy units */
  initialEnemyUnits: UncontrolledUnit[];
  /** Auto-battle mode */
  autoBattle?: boolean;
  /** Turn delay in ms */
  turnDelay?: number;
  /** Called when battle ends */
  onBattleEnd?: (victory: boolean) => void;
  /** Called each turn */
  onTurn?: (turn: number) => void;
  /** Event name for battle end */
  battleEndEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const UncontrolledBattleBoard: React.FC<UncontrolledBattleBoardProps> = ({
  initialPlayerUnits,
  initialEnemyUnits,
  autoBattle = false,
  turnDelay = 1000,
  onBattleEnd,
  onTurn,
  battleEndEvent,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();
  
  const [playerUnits, setPlayerUnits] = useState(initialPlayerUnits);
  const [enemyUnits, setEnemyUnits] = useState(initialEnemyUnits);
  const [turn, setTurn] = useState(1);
  const [isAuto, setIsAuto] = useState(autoBattle);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isBattleOver, setIsBattleOver] = useState(false);

  const livingPlayers = playerUnits.filter(u => !u.isDead && u.hp > 0);
  const livingEnemies = enemyUnits.filter(u => !u.isDead && u.hp > 0);

  // Check battle end conditions
  useEffect(() => {
    if (isBattleOver) return;
    
    if (livingEnemies.length === 0) {
      setIsBattleOver(true);
      if (battleEndEvent) eventBus.emit(`UI:${battleEndEvent}`, { victory: true });
      onBattleEnd?.(true);
    } else if (livingPlayers.length === 0) {
      setIsBattleOver(true);
      if (battleEndEvent) eventBus.emit(`UI:${battleEndEvent}`, { victory: false });
      onBattleEnd?.(false);
    }
  }, [livingPlayers.length, livingEnemies.length, isBattleOver, onBattleEnd, battleEndEvent, eventBus]);

  // Auto-battle logic
  useEffect(() => {
    if (!isAuto || isBattleOver) return;

    const timer = setTimeout(() => {
      processTurn();
    }, turnDelay);

    return () => clearTimeout(timer);
  }, [isAuto, turn, isBattleOver, turnDelay]);

  const addLog = (message: string) => {
    setBattleLog(prev => [message, ...prev].slice(0, 5));
  };

  const processTurn = useCallback(() => {
    if (isBattleOver) return;

    // Simple turn logic: player attacks enemy, enemy attacks player
    const attacker = turn % 2 === 1 ? livingPlayers[0] : livingEnemies[0];
    const targets = turn % 2 === 1 ? livingEnemies : livingPlayers;
    const target = targets[0];

    if (!attacker || !target) return;

    // Calculate damage
    const damage = Math.floor(Math.random() * 10) + 5;
    
    if (turn % 2 === 1) {
      // Player attacks
      setEnemyUnits(prev => prev.map(u => 
        u.id === target.id 
          ? { ...u, hp: Math.max(0, u.hp - damage), isDead: u.hp - damage <= 0 }
          : u
      ));
      addLog(`${attacker.name} attacks ${target.name} for ${damage} damage!`);
    } else {
      // Enemy attacks
      setPlayerUnits(prev => prev.map(u => 
        u.id === target.id 
          ? { ...u, hp: Math.max(0, u.hp - damage), isDead: u.hp - damage <= 0 }
          : u
      ));
      addLog(`${attacker.name} attacks ${target.name} for ${damage} damage!`);
    }

    const newTurn = turn + 1;
    setTurn(newTurn);
    onTurn?.(newTurn);
  }, [turn, livingPlayers, livingEnemies, isBattleOver, onTurn]);

  const renderUnit = (unit: UncontrolledUnit) => {
    const hpPercent = (unit.hp / unit.maxHp) * 100;

    return (
      <View 
        key={unit.id}
        style={[
          styles.unitCard,
          {
            opacity: unit.isDead || unit.hp <= 0 ? 0.4 : 1,
            borderColor: unit.isPlayer ? '#3b82f6' : '#ef4444',
          }
        ]}
      >
        <Text style={styles.unitName}>{unit.name}</Text>
        <View style={styles.hpBar}>
          <View 
            style={[
              styles.hpFill,
              { 
                width: `${hpPercent}%`,
                backgroundColor: hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#fbbf24' : '#ef4444',
              }
            ]} 
          />
        </View>
        <Text style={styles.hpText}>{unit.hp}/{unit.maxHp} HP</Text>
      </View>
    );
  };

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h4" style={{ color: '#fff' }}>
            Battle - Turn {turn}
          </Typography>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isBattleOver ? '#6b7280' : isAuto ? '#22c55e' : '#3b82f6' }
          ]}>
            <Text style={styles.statusText}>
              {isBattleOver ? 'ENDED' : isAuto ? 'AUTO' : 'MANUAL'}
            </Text>
          </View>
        </View>

        {/* Battlefield */}
        <View style={styles.battlefield}>
          {/* Player side */}
          <VStack spacing={8} style={styles.side}>
            <Text style={[styles.sideLabel, { color: '#3b82f6' }]}>PLAYERS</Text>
            {playerUnits.map(renderUnit)}
          </VStack>

          <View style={styles.vsDivider}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Enemy side */}
          <VStack spacing={8} style={styles.side}>
            <Text style={[styles.sideLabel, { color: '#ef4444' }]}>ENEMIES</Text>
            {enemyUnits.map(renderUnit)}
          </VStack>
        </View>

        {/* Battle log */}
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Battle Log</Text>
          {battleLog.length === 0 ? (
            <Text style={styles.emptyLog}>Battle has not started...</Text>
          ) : (
            battleLog.map((log, index) => (
              <Text key={index} style={styles.logEntry}>{log}</Text>
            ))
          )}
        </View>

        {/* Controls */}
        {!isBattleOver && (
          <HStack spacing={8} justify="center">
            {!isAuto && (
              <Button 
                variant="primary" 
                onPress={processTurn}
                style={styles.controlButton}
              >
                Next Turn
              </Button>
            )}
            <Button 
              variant="secondary" 
              onPress={() => setIsAuto(!isAuto)}
              style={styles.controlButton}
            >
              {isAuto ? 'Pause' : 'Auto'}
            </Button>
          </HStack>
        )}

        {/* Battle result */}
        {isBattleOver && (
          <View style={[
            styles.resultBanner,
            { backgroundColor: livingEnemies.length === 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
          ]}>
            <Typography 
              variant="h3" 
              style={{ color: livingEnemies.length === 0 ? '#22c55e' : '#ef4444' }}
            >
              {livingEnemies.length === 0 ? 'VICTORY!' : 'DEFEAT'}
            </Typography>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  battlefield: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 16,
  },
  side: {
    flex: 1,
  },
  sideLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  vsDivider: {
    justifyContent: 'center',
  },
  vsText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '700',
  },
  unitCard: {
    padding: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    borderLeftWidth: 3,
    gap: 4,
  },
  unitName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hpBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
  },
  hpText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  logContainer: {
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    minHeight: 100,
  },
  logTitle: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyLog: {
    color: '#4b5563',
    fontStyle: 'italic',
  },
  logEntry: {
    color: '#9ca3af',
    fontSize: 12,
    paddingVertical: 2,
  },
  controlButton: {
    minWidth: 100,
  },
  resultBanner: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

UncontrolledBattleBoard.displayName = 'UncontrolledBattleBoard';
