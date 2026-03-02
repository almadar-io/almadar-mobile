import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback,
  useRef,
  ReactNode 
} from 'react';
import { useEventBus } from '../../../hooks/useEventBus';

export interface AudioTrack {
  id: string;
  src: string;
  volume?: number;
  loop?: boolean;
}

export interface GameAudioContextValue {
  /** Whether audio is globally enabled */
  isEnabled: boolean;
  /** Current master volume (0-1) */
  masterVolume: number;
  /** Currently playing music track ID */
  currentMusic: string | null;
  /** Toggle all audio on/off */
  toggle: () => void;
  /** Set master volume */
  setVolume: (volume: number) => void;
  /** Play a music track */
  playMusic: (trackId: string, options?: { loop?: boolean; fadeIn?: number }) => void;
  /** Stop current music */
  stopMusic: (options?: { fadeOut?: number }) => void;
  /** Play a sound effect */
  playSfx: (soundId: string, options?: { volume?: number }) => void;
  /** Register a track for later use */
  registerTrack: (track: AudioTrack) => void;
  /** Mute/unmute a specific category */
  setCategoryMuted: (category: 'music' | 'sfx', muted: boolean) => void;
}

const GameAudioContext = createContext<GameAudioContextValue | null>(null);

export interface GameAudioProviderProps {
  children: ReactNode;
  /** Initial enabled state */
  defaultEnabled?: boolean;
  /** Initial master volume */
  defaultVolume?: number;
  /** Available tracks */
  tracks?: AudioTrack[];
  /** Event name for toggle events */
  toggleEvent?: string;
}

export const GameAudioProvider: React.FC<GameAudioProviderProps> = ({
  children,
  defaultEnabled = true,
  defaultVolume = 0.7,
  tracks = [],
  toggleEvent,
}) => {
  const eventBus = useEventBus();
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [masterVolume, setMasterVolume] = useState(defaultVolume);
  const [currentMusic, setCurrentMusic] = useState<string | null>(null);
  const [categoryMuted, setCategoryMuted] = useState({
    music: false,
    sfx: false,
  });
  
  // Track registry
  const trackRegistry = useRef<Map<string, AudioTrack>>(new Map());
  
  // Register initial tracks
  React.useEffect(() => {
    tracks.forEach(track => {
      trackRegistry.current.set(track.id, track);
    });
  }, [tracks]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      if (toggleEvent) {
        eventBus.emit(`UI:${toggleEvent}`, { enabled: newValue });
      }
      return newValue;
    });
  }, [toggleEvent, eventBus]);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setMasterVolume(clamped);
  }, []);

  const playMusic = useCallback((trackId: string, _options?: { loop?: boolean; fadeIn?: number }) => {
    if (!isEnabled || categoryMuted.music) return;
    
    const track = trackRegistry.current.get(trackId);
    if (!track) {
      console.warn(`Track "${trackId}" not found in registry`);
      return;
    }
    
    setCurrentMusic(trackId);
    // In a real implementation, this would use react-native-sound or expo-av
    console.log(`[Audio] Playing music: ${trackId}`);
  }, [isEnabled, categoryMuted.music]);

  const stopMusic = useCallback((_options?: { fadeOut?: number }) => {
    setCurrentMusic(null);
    console.log('[Audio] Stopping music');
  }, []);

  const playSfx = useCallback((soundId: string, _options?: { volume?: number }) => {
    if (!isEnabled || categoryMuted.sfx) return;
    console.log(`[Audio] Playing SFX: ${soundId}`);
  }, [isEnabled, categoryMuted.sfx]);

  const registerTrack = useCallback((track: AudioTrack) => {
    trackRegistry.current.set(track.id, track);
  }, []);

  const handleCategoryMute = useCallback((category: 'music' | 'sfx', muted: boolean) => {
    setCategoryMuted(prev => ({ ...prev, [category]: muted }));
  }, []);

  const value: GameAudioContextValue = {
    isEnabled,
    masterVolume,
    currentMusic,
    toggle,
    setVolume,
    playMusic,
    stopMusic,
    playSfx,
    registerTrack,
    setCategoryMuted: handleCategoryMute,
  };

  return (
    <GameAudioContext.Provider value={value}>
      {children}
    </GameAudioContext.Provider>
  );
};

export const useGameAudio = (): GameAudioContextValue => {
  const context = useContext(GameAudioContext);
  if (!context) {
    throw new Error('useGameAudio must be used within a GameAudioProvider');
  }
  return context;
};

GameAudioProvider.displayName = 'GameAudioProvider';
