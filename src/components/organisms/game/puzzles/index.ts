/**
 * Puzzle Game Components - Phase 9 Educational Puzzles
 *
 * These components implement educational puzzle games for teaching
 * programming concepts at different age levels:
 *
 * - NegotiatorBoard (ages 10+): Game theory, decision making
 * - SequencerBoard (ages 5-8): Sequence building, ordering
 * - SimulatorBoard (ages 11+): Parameter adjustment, simulation
 * - StateArchitectBoard (ages 13+): State machines, transitions
 * - RuleEditor (helper): Event-action rule builder
 */

// Negotiator - Game theory and decision making
export { NegotiatorBoard } from './negotiator/NegotiatorBoard';
export type {
  NegotiatorBoardProps,
  NegotiatorPuzzleEntity,
  NegotiatorAction,
  PayoffEntry,
} from './negotiator/NegotiatorBoard';

// Sequencer - Sequence building for young learners
export { SequencerBoard } from './sequencer/SequencerBoard';
export type {
  SequencerBoardProps,
  SequencerPuzzleEntity,
  SequencerAction,
} from './sequencer/SequencerBoard';

// Simulator - Parameter adjustment and simulation
export { SimulatorBoard } from './simulator/SimulatorBoard';
export type {
  SimulatorBoardProps,
  SimulatorPuzzleEntity,
  SimulatorParameter,
} from './simulator/SimulatorBoard';

// StateArchitect - State machine design
export { StateArchitectBoard } from './state-architect/StateArchitectBoard';
export type {
  StateArchitectBoardProps,
  StateArchitectPuzzleEntity,
  StateArchitectTransition,
  TestCase,
  VariableDef,
} from './state-architect/StateArchitectBoard';

// EventHandler - Rule editor helper
export { RuleEditor } from './event-handler/RuleEditor';
export type {
  RuleEditorProps,
  RuleDefinition,
} from './event-handler/RuleEditor';

export { EventLog } from './event-handler/EventLog';
export type {
  EventLogProps,
  EventLogEntry,
} from './event-handler/EventLog';

export { ObjectRulePanel } from './event-handler/ObjectRulePanel';
export type {
  ObjectRulePanelProps,
  PuzzleObjectDef,
} from './event-handler/ObjectRulePanel';

export { EventHandlerBoard } from './event-handler/EventHandlerBoard';
export type {
  EventHandlerBoardProps,
  EventHandlerPuzzleEntity,
} from './event-handler/EventHandlerBoard';

// Phase 9 Puzzle Game Components
export { BuilderBoard } from './builder/BuilderBoard';
export type {
  BuilderBoardProps,
  BuilderComponent,
  BuilderSlot,
  BuilderPuzzleEntity,
} from './builder/BuilderBoard';

export { ClassifierBoard } from './classifier/ClassifierBoard';
export type {
  ClassifierBoardProps,
  ClassifierItem,
  ClassifierCategory,
  ClassifierPuzzleEntity,
} from './classifier/ClassifierBoard';

export { DebuggerBoard } from './debugger/DebuggerBoard';
export type {
  DebuggerBoardProps,
  DebuggerLine,
  DebuggerPuzzleEntity,
} from './debugger/DebuggerBoard';

// Phase 11 State Architect components
export { VariablePanel } from './state-architect/VariablePanel';
export type { VariablePanelProps, Variable, VariableType } from './state-architect/VariablePanel';

export { CodeView } from './state-architect/CodeView';
export type { CodeViewProps, CodeSection } from './state-architect/CodeView';

// Sequencer sub-components
export { ActionPalette } from './sequencer/ActionPalette';
export type {
  ActionPaletteProps,
  ActionDefinition,
  ActionCategory,
} from './sequencer/ActionPalette';

export { ActionTile } from './sequencer/ActionTile';
export type {
  ActionTileProps,
  ActionTileSize,
  ActionTileVariant,
} from './sequencer/ActionTile';

export { SequenceBar } from './sequencer/SequenceBar';
export type {
  SequenceBarProps,
  SequenceStep,
} from './sequencer/SequenceBar';

// State Architect sub-components
export { StateNode } from './state-architect/StateNode';
export type {
  StateNodeProps,
  StateNodeData,
  StateNodeType,
} from './state-architect/StateNode';

export { TransitionArrow } from './state-architect/TransitionArrow';
export type {
  TransitionArrowProps,
  TransitionArrowData,
  TransitionType,
} from './state-architect/TransitionArrow';
