import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle,
  ScrollView 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';
import { VStack, HStack } from '../../atoms/Stack';

export interface CastleRoom {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  unlocked?: boolean;
  visited?: boolean;
  level?: number;
  x: number;
  y: number;
  connections?: string[];
}

export interface CastleBoardProps {
  /** All rooms in the castle */
  rooms: CastleRoom[];
  /** Current room ID */
  currentRoomId?: string;
  /** Callback when room is selected */
  onSelectRoom?: (roomId: string) => void;
  /** Event name for room selection */
  selectRoomEvent?: string;
  /** Castle name/title */
  title?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const CastleBoard: React.FC<CastleBoardProps> = ({
  rooms,
  currentRoomId,
  onSelectRoom,
  selectRoomEvent,
  title,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();

  const handleSelectRoom = (roomId: string) => {
    if (selectRoomEvent) eventBus.emit(`UI:${selectRoomEvent}`, { roomId });
    onSelectRoom?.(roomId);
  };

  // Group rooms by floor/level for vertical layout
  const roomsByLevel = rooms.reduce((acc, room) => {
    const level = room.level || 1;
    if (!acc[level]) acc[level] = [];
    acc[level].push(room);
    return acc;
  }, {} as Record<number, CastleRoom[]>);

  const sortedLevels = Object.keys(roomsByLevel)
    .map(Number)
    .sort((a, b) => b - a); // Highest level at top

  const renderRoom = (room: CastleRoom) => {
    const isCurrent = room.id === currentRoomId;
    const isUnlocked = room.unlocked !== false;
    const isVisited = room.visited;

    return (
      <TouchableOpacity
        key={room.id}
        onPress={() => isUnlocked && handleSelectRoom(room.id)}
        disabled={!isUnlocked}
        style={[
          styles.room,
          {
            backgroundColor: isCurrent 
              ? '#fbbf24' 
              : isVisited 
                ? '#374151' 
                : '#1f2937',
            borderColor: isCurrent ? '#f59e0b' : isUnlocked ? '#4b5563' : '#1f2937',
            borderWidth: 2,
            opacity: isUnlocked ? 1 : 0.4,
          },
        ]}
      >
        <Text style={{ fontSize: 24 }}>
          {isUnlocked ? (room.icon || '🚪') : '🔒'}
        </Text>
        <Text 
          style={[
            styles.roomName,
            { color: isCurrent ? '#000' : '#fff' }
          ]} 
          numberOfLines={1}
        >
          {isUnlocked ? room.name : '???'}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentRoom = rooms.find(r => r.id === currentRoomId);

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={16}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h3" style={{ color: '#fff' }}>
            {title || '🏰 Castle'}
          </Typography>
          {currentRoom && (
            <Text style={styles.currentRoom}>
              Location: {currentRoom.name}
            </Text>
          )}
        </View>

        {/* Map */}
        <ScrollView 
          style={styles.mapContainer}
          contentContainerStyle={styles.mapContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedLevels.map(level => (
            <View key={level} style={styles.floor}>
              <Text style={styles.floorLabel}>F{level}</Text>
              <HStack spacing={12} style={styles.floorRooms}>
                {roomsByLevel[level].map(renderRoom)}
              </HStack>
            </View>
          ))}
        </ScrollView>

        {/* Selected room info */}
        {currentRoom && (
          <View style={styles.roomInfo}>
            <Typography variant="h4" style={{ color: '#fbbf24' }}>
              {currentRoom.icon} {currentRoom.name}
            </Typography>
            {currentRoom.description && (
              <Text style={styles.description}>
                {currentRoom.description}
              </Text>
            )}
            <Text style={styles.connections}>
              Connections: {currentRoom.connections?.length || 0}
            </Text>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  currentRoom: {
    color: '#9ca3af',
    fontSize: 12,
  },
  mapContainer: {
    maxHeight: 300,
  },
  mapContent: {
    paddingVertical: 8,
  },
  floor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  floorLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    width: 24,
  },
  floorRooms: {
    flexWrap: 'wrap',
  },
  room: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  roomName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 70,
  },
  roomInfo: {
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    gap: 8,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
  connections: {
    color: '#6b7280',
    fontSize: 12,
  },
});

CastleBoard.displayName = 'CastleBoard';
