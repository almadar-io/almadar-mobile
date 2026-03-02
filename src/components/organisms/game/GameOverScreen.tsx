import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle,
  Animated
} from 'react-native';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';
import { Button } from '../../atoms/Button';



export interface GameOverStats {
  label: string;
  value: string | number;
  highlighted?: boolean;
}

export interface GameOverScreenProps {
  /** Win or lose state */
  victory?: boolean;
  /** Final score */
  score?: number;
  /** High score */
  highScore?: number;
  /** Stats to display */
  stats?: GameOverStats[];
  /** Time spent in run */
  timeElapsed?: string;
  /** Wave/enemy stats */
  wavesCompleted?: number;
  totalWaves?: number;
  /** Event names for declarative actions */
  retryEvent?: string;
  menuEvent?: string;
  shareEvent?: string;
  /** Callbacks */
  onRetry?: () => void;
  onMenu?: () => void;
  onShare?: () => void;
  /** Whether buttons are loading */
  isLoading?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  victory = false,
  score = 0,
  highScore,
  stats = [],
  timeElapsed,
  wavesCompleted,
  totalWaves,
  retryEvent,
  menuEvent,
  shareEvent,
  onRetry,
  onMenu,
  onShare,
  isLoading = false,
  style,
}) => {
  useTheme(); // Theme hook required by pattern
  const eventBus = useEventBus();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRetry = () => {
    if (retryEvent) eventBus.emit(`UI:${retryEvent}`, {});
    onRetry?.();
  };

  const handleMenu = () => {
    if (menuEvent) eventBus.emit(`UI:${menuEvent}`, {});
    onMenu?.();
  };

  const handleShare = () => {
    if (shareEvent) eventBus.emit(`UI:${shareEvent}`, { score, victory });
    onShare?.();
  };

  const newHighScore = highScore !== undefined && score > highScore;

  return (
    <View style={[styles.container, ...(style ? [style] : [])]}>
      {/* Background overlay */}
      <View style={styles.overlay} />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Card style={styles.card}>
          <VStack spacing={24} align="center">
            {/* Victory/Defeat Header */}
            <View style={[
              styles.headerBadge,
              { backgroundColor: victory ? '#22c55e' : '#ef4444' }
            ]}>
              <Typography 
                variant="h2" 
                style={{ color: '#fff', fontWeight: '800' }}
              >
                {victory ? 'VICTORY!' : 'DEFEAT'}
              </Typography>
            </View>

            {/* Score Section */}
            <VStack spacing={8} align="center">
              <Typography variant="caption" style={{ color: '#9ca3af' }}>
                FINAL SCORE
              </Typography>
              <Typography 
                variant="h1" 
                style={{ 
                  fontSize: 48, 
                  color: newHighScore ? '#fbbf24' : '#fff',
                }}
              >
                {score.toLocaleString()}
              </Typography>
              {newHighScore && (
                <Text style={styles.newHighScoreBadge}>NEW HIGH SCORE!</Text>
              )}
              {highScore !== undefined && !newHighScore && (
                <Typography variant="caption" style={{ color: '#6b7280' }}>
                  High Score: {highScore.toLocaleString()}
                </Typography>
              )}
            </VStack>

            {/* Stats Grid */}
            {stats.length > 0 && (
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.statItem,
                      stat.highlighted && styles.statHighlighted
                    ]}
                  >
                    <Typography 
                      variant="caption" 
                      style={{ color: '#6b7280' }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </View>
                ))}
                {timeElapsed && (
                  <View style={styles.statItem}>
                    <Typography variant="caption" style={{ color: '#6b7280' }}>
                      TIME
                    </Typography>
                    <Typography variant="h4">
                      {timeElapsed}
                    </Typography>
                  </View>
                )}
                {wavesCompleted !== undefined && (
                  <View style={styles.statItem}>
                    <Typography variant="caption" style={{ color: '#6b7280' }}>
                      WAVES
                    </Typography>
                    <Typography variant="h4">
                      {wavesCompleted}{totalWaves ? `/${totalWaves}` : ''}
                    </Typography>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <VStack spacing={12} style={styles.actions}>
              <Button
                variant="primary"
                size="lg"
                onPress={handleRetry}
                disabled={isLoading}
                style={{ minWidth: 200 }}
              >
                {victory ? 'PLAY AGAIN' : 'TRY AGAIN'}
              </Button>
              
              <Button
                variant="secondary"
                size="md"
                onPress={handleMenu}
                disabled={isLoading}
                style={{ minWidth: 200 }}
              >
                MAIN MENU
              </Button>

              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleShare}
                  disabled={isLoading}
                >
                  SHARE RESULT
                </Button>
              )}
            </VStack>
          </VStack>
        </Card>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  content: {
    width: '90%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
  },
  headerBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newHighScoreBadge: {
    backgroundColor: '#fbbf24',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statHighlighted: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
});

GameOverScreen.displayName = 'GameOverScreen';
