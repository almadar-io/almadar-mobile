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
import { VStack } from '../../atoms/Stack';



export interface MapNode {
  id: string;
  name: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  type?: 'start' | 'boss' | 'shop' | 'event' | 'combat' | 'rest';
  icon?: string;
  visited?: boolean;
  available?: boolean;
  locked?: boolean;
  tooltip?: string;
}

export interface MapConnection {
  from: string;
  to: string;
}

export interface WorldMapBoardProps {
  /** All nodes on the map */
  nodes: MapNode[];
  /** Connections between nodes */
  connections?: MapConnection[];
  /** Currently selected node ID */
  currentNodeId?: string;
  /** Player position node ID */
  playerNodeId?: string;
  /** Map title */
  title?: string;
  /** Current act/region name */
  act?: string;
  /** Callback when node is selected */
  onSelectNode?: (nodeId: string) => void;
  /** Event name for node selection */
  selectNodeEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const WorldMapBoard: React.FC<WorldMapBoardProps> = ({
  nodes,
  connections = [],
  currentNodeId,
  playerNodeId,
  title,
  act,
  onSelectNode,
  selectNodeEvent,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();

  const handleSelectNode = (nodeId: string) => {
    if (selectNodeEvent) eventBus.emit(`UI:${selectNodeEvent}`, { nodeId });
    onSelectNode?.(nodeId);
  };

  const getNodeIcon = (type?: string) => {
    switch (type) {
      case 'start': return '🏁';
      case 'boss': return '👹';
      case 'shop': return '🏪';
      case 'event': return '❓';
      case 'rest': return '🔥';
      case 'combat':
      default: return '⚔️';
    }
  };

  const getNodeColor = (node: MapNode) => {
    if (node.id === playerNodeId) return '#22c55e';
    if (node.locked) return '#374151';
    if (node.visited) return '#6b7280';
    if (node.available) return '#fbbf24';
    return '#4b5563';
  };

  const currentNode = nodes.find(n => n.id === currentNodeId);
  const playerNode = nodes.find(n => n.id === playerNodeId);

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <VStack spacing={12}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Typography variant="h3" style={{ color: '#fff' }}>
              {title || '🗺️ World Map'}
            </Typography>
            {act && (
              <Text style={styles.actLabel}>{act}</Text>
            )}
          </View>
          {playerNode && (
            <View style={styles.playerBadge}>
              <Text style={styles.playerText}>You are here</Text>
            </View>
          )}
        </View>

        {/* Map area */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mapScrollContent}
        >
          <View style={styles.mapArea}>
            {/* Connection lines - simplified as dotted paths */}
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              return (
                <View
                  key={idx}
                  style={[
                    styles.connection,
                    {
                      left: `${Math.min(fromNode.x, toNode.x)}%`,
                      top: `${Math.min(fromNode.y, toNode.y)}%`,
                      width: `${Math.abs(toNode.x - fromNode.x)}%`,
                      height: `${Math.abs(toNode.y - fromNode.y)}%`,
                    },
                  ]}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <TouchableOpacity
                key={node.id}
                onPress={() => !node.locked && handleSelectNode(node.id)}
                disabled={node.locked}
                style={[
                  styles.node,
                  {
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    backgroundColor: getNodeColor(node),
                    opacity: node.locked ? 0.3 : 1,
                    borderWidth: node.id === currentNodeId ? 3 : 0,
                    borderColor: '#fff',
                  },
                ]}
              >
                <Text style={styles.nodeIcon}>
                  {node.icon || getNodeIcon(node.type)}
                </Text>
                
                {/* Player indicator */}
                {node.id === playerNodeId && (
                  <View style={styles.playerIndicator}>
                    <Text>🧙</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            {[
              { type: 'combat', label: 'Combat', icon: '⚔️' },
              { type: 'shop', label: 'Shop', icon: '🏪' },
              { type: 'event', label: 'Event', icon: '❓' },
              { type: 'rest', label: 'Rest', icon: '🔥' },
              { type: 'boss', label: 'Boss', icon: '👹' },
            ].map(item => (
              <View key={item.type} style={styles.legendItem}>
                <Text>{item.icon}</Text>
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected node info */}
        {currentNode && (
          <View style={styles.nodeInfo}>
            <Typography variant="h4">
              {currentNode.icon || getNodeIcon(currentNode.type)} {currentNode.name}
            </Typography>
            {currentNode.tooltip && (
              <Text style={styles.tooltip}>{currentNode.tooltip}</Text>
            )}
            {!currentNode.available && !currentNode.visited && (
              <Text style={styles.lockedText}>🔒 Locked</Text>
            )}
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
  actLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  playerBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  playerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mapScrollContent: {
    paddingHorizontal: 8,
  },
  mapArea: {
    width: 600,
    height: 400,
    backgroundColor: '#111827',
    borderRadius: 12,
    position: 'relative',
  },
  connection: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#4b5563',
    borderStyle: 'dashed',
  },
  node: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    marginLeft: 24,
    marginTop: 24,
  },
  nodeIcon: {
    fontSize: 20,
  },
  playerIndicator: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#22c55e',
    padding: 4,
    borderRadius: 12,
  },
  legend: {
    padding: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  legendTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  nodeInfo: {
    padding: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  tooltip: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  lockedText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

WorldMapBoard.displayName = 'WorldMapBoard';
