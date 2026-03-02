// Game Organisms - High-level game UI components
// Ported from @almadar/ui with exact interface matching

export { BattleBoard } from './BattleBoard';
export type { BattleBoardProps, BattleUnit } from './BattleBoard';

export { CanvasEffect } from './CanvasEffect';
export type { CanvasEffectProps, EffectType } from './CanvasEffect';

export { CastleBoard } from './CastleBoard';
export type { CastleBoardProps, CastleRoom } from './CastleBoard';

export { CombatLog } from './CombatLog';
export type { CombatLogProps, CombatEvent, CombatLogEventType } from './CombatLog';

export { DialogueBox } from './DialogueBox';
export type { DialogueBoxProps, DialogueChoice, DialogueNode } from './DialogueBox';

export { GameAudioProvider, useGameAudio } from './GameAudioProvider';
export type { GameAudioProviderProps, GameAudioContextValue, AudioTrack } from './GameAudioProvider';

export { GameAudioToggle } from './GameAudioToggle';
export type { GameAudioToggleProps } from './GameAudioToggle';

export { GameCanvas3D } from './GameCanvas3D';
export type { GameCanvas3DProps } from './GameCanvas3D';

export { GameHud } from './GameHud';
export type { GameHudProps, GameHudStat, GameHudElement } from './GameHud';

export { GameMenu } from './GameMenu';
export type { GameMenuProps, MenuOption } from './GameMenu';

export { GameOverScreen } from './GameOverScreen';
export type { GameOverScreenProps, GameOverStats } from './GameOverScreen';

export { InventoryPanel } from './InventoryPanel';
export type { InventoryPanelProps, InventoryItem } from './InventoryPanel';

export { IsometricCanvas } from './IsometricCanvas';
export type { IsometricCanvasProps } from './IsometricCanvas';

export { TraitSlot } from './TraitSlot';
export type { TraitSlotProps } from './TraitSlot';

export { TraitStateViewer } from './TraitStateViewer';
export type { TraitStateViewerProps } from './TraitStateViewer';

export { UncontrolledBattleBoard } from './UncontrolledBattleBoard';
export type { UncontrolledBattleBoardProps } from './UncontrolledBattleBoard';

export { WorldMapBoard } from './WorldMapBoard';
export type { WorldMapBoardProps, MapNode, MapConnection } from './WorldMapBoard';

// Puzzle Games - Phase 9 Educational Components
export * from './puzzles';

// Physics simulation components
export * from './physics-sim';
