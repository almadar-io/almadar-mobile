import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle,
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';

const { width } = Dimensions.get('window');

export interface IsometricTile {
  x: number;
  y: number;
  z?: number;
  type?: string;
  color?: string;
  height?: number;
}

export interface IsometricCanvasProps {
  /** Tiles to render */
  tiles?: IsometricTile[];
  /** Grid dimensions */
  gridWidth?: number;
  gridHeight?: number;
  /** Tile size in pixels */
  tileSize?: number;
  /** Camera offset */
  offsetX?: number;
  offsetY?: number;
  /** Zoom level */
  zoom?: number;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Background color */
  backgroundColor?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * IsometricCanvas - 2.5D isometric tile renderer
 * 
 * Note: This is a simplified implementation. For full 3D isometric rendering,
 * consider using react-native-game-engine or a WebView with Three.js/Phaser.
 * 
 * @example
 * ```tsx
 * <IsometricCanvas
 *   tiles={[
 *     { x: 0, y: 0, type: 'grass', color: '#22c55e' },
 *     { x: 1, y: 0, type: 'water', color: '#3b82f6' },
 *   ]}
 *   gridWidth={10}
 *   gridHeight={10}
 * />
 * ```
 */
export const IsometricCanvas: React.FC<IsometricCanvasProps> = ({
  tiles = [],
  gridWidth = 10,
  gridHeight = 10,
  tileSize = 32,
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
  showGrid = true,
  backgroundColor = '#0f172a',
  isLoading = false,
  error = null,
  style,
}) => {
  const theme = useTheme();
  
  const canvasWidth = width - 32;
  const canvasHeight = canvasWidth * 0.75;

  // Convert isometric coordinates to screen coordinates
  const isoToScreen = (x: number, y: number, z: number = 0) => {
    const isoX = (x - y) * (tileSize * zoom * 0.866);
    const isoY = (x + y) * (tileSize * zoom * 0.5) - (z * tileSize * zoom * 0.5);
    return {
      x: isoX + canvasWidth / 2 + offsetX,
      y: isoY + canvasHeight / 3 + offsetY,
    };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }, ...(style ? [style] : [])]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading isometric view...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }, style]}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Canvas placeholder showing grid info */}
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {/* Grid info overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.infoText}>Isometric View</Text>
          <Text style={styles.infoSubtext}>
            Grid: {gridWidth}x{gridHeight}
          </Text>
          <Text style={styles.infoSubtext}>
            Tiles: {tiles.length}
          </Text>
          <Text style={styles.infoSubtext}>
            Zoom: {Math.round(zoom * 100)}%
          </Text>
        </View>
        
        {/* Tile preview */}
        <View style={styles.tilePreview}>
          {tiles.slice(0, 5).map((tile, index) => {
            const pos = isoToScreen(tile.x, tile.y, tile.z || 0);
            return (
              <View
                key={index}
                style={[
                  styles.tile,
                  {
                    left: pos.x,
                    top: pos.y,
                    backgroundColor: tile.color || '#4b5563',
                    width: tileSize * zoom,
                    height: tileSize * zoom * 0.5,
                  },
                ]}
              >
                <Text style={styles.tileType}>{tile.type?.[0] || '?'}</Text>
              </View>
            );
          })}
        </View>
        
        {/* Grid lines representation */}
        {showGrid && (
          <View style={styles.gridIndicator}>
            <Text style={styles.gridText}>Grid: {gridWidth}×{gridHeight}</Text>
          </View>
        )}
      </View>
      
      {/* Note about WebView implementation */}
      <Text style={styles.note}>
        Note: Full isometric rendering requires WebView with Three.js or{' '}
        react-native-game-engine for production use.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  canvas: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    overflow: 'hidden',
  },
  infoOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 6,
  },
  infoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoSubtext: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  tilePreview: {
    ...StyleSheet.absoluteFillObject,
  },
  tile: {
    position: 'absolute',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotateX: '60deg' }],
  },
  tileType: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  gridIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 4,
  },
  gridText: {
    color: '#6b7280',
    fontSize: 10,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  note: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
});

IsometricCanvas.displayName = 'IsometricCanvas';
