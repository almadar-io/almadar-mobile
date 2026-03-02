import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useGameAudio } from './GameAudioProvider';
import { useTheme } from '../../../providers/ThemeContext';
import { useEventBus } from '../../../hooks/useEventBus';
import { Card } from '../../atoms/Card';
import { VStack } from '../../atoms/Stack';

export interface GameAudioToggleProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show volume slider */
  showVolume?: boolean;
  /** Show category toggles */
  showCategories?: boolean;
  /** Callback when toggled */
  onToggle?: (enabled: boolean) => void;
  /** Declarative event name */
  toggleEvent?: string;
  /** Additional styles */
  style?: ViewStyle;
}

export const GameAudioToggle: React.FC<GameAudioToggleProps> = ({
  size = 'md',
  showVolume = false,
  showCategories = false,
  onToggle,
  toggleEvent,
  style,
}) => {
  const theme = useTheme();
  const eventBus = useEventBus();
  
  // Try to use game audio context, fallback to local state if not available
  let audio: ReturnType<typeof useGameAudio> | null = null;
  try {
    audio = useGameAudio();
  } catch {
    // Provider not available
  }

  const isEnabled = audio?.isEnabled ?? true;
  const masterVolume = audio?.masterVolume ?? 0.7;

  const handleToggle = () => {
    const newValue = !isEnabled;
    
    if (toggleEvent) {
      eventBus.emit(`UI:${toggleEvent}`, { enabled: newValue });
    }
    
    audio?.toggle();
    onToggle?.(newValue);
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 20;
      case 'lg': return 32;
      default: return 24;
    }
  };

  const iconSize = getIconSize();

  return (
    <Card style={[styles.container, ...(style ? [style] : [])]}>
      <TouchableOpacity onPress={handleToggle} style={styles.button}>
        <Text style={{ fontSize: iconSize }}>
          {isEnabled ? '🔊' : '🔇'}
        </Text>
        <Text style={[
          styles.label,
          { fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14 }
        ]}>
          {isEnabled ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>

      {showVolume && audio && (
        <View style={styles.volumeContainer}>
          <Text style={styles.volumeIcon}>🔉</Text>
          <View style={styles.volumeBar}>
            <View 
              style={[
                styles.volumeFill,
                { width: `${masterVolume * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.volumeText}>{Math.round(masterVolume * 100)}%</Text>
        </View>
      )}

      {showCategories && audio && (
        <VStack spacing={8} style={styles.categories}>
          <TouchableOpacity
            onPress={() => audio?.setCategoryMuted('music', !audio.currentMusic)}
            style={styles.categoryRow}
          >
            <Text>🎵 Music</Text>
            <Text style={{ color: audio.currentMusic ? theme.colors.primary : '#666' }}>
              {audio.currentMusic ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={styles.categoryRow}
          >
            <Text>🔊 SFX</Text>
            <Text style={{ color: '#666' }}>ON</Text>
          </TouchableOpacity>
        </VStack>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    width: '100%',
  },
  volumeIcon: {
    fontSize: 14,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  volumeText: {
    color: '#9ca3af',
    fontSize: 12,
    minWidth: 35,
    textAlign: 'right',
  },
  categories: {
    marginTop: 12,
    width: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1f2937',
    borderRadius: 6,
  },
});

GameAudioToggle.displayName = 'GameAudioToggle';
