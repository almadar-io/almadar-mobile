# @almadar/mobile Component Audit & Porting Plan

> Last updated: 2026-03-01

## Current Status Summary

| Category | Ported | Total | Coverage |
|----------|--------|-------|----------|
| Atoms | 20 | 27 | 74% |
| Molecules | 23 | 42 | 55% |
| Organisms | 30 | 74 | 41% |
| Templates | 2 | 11 | 18% |
| **Total** | **75** | **154** | **49%** |

---

## Components to Port (79 remaining)

### ✅ COMPLETED (75)

#### Atoms (20)
- Avatar, Badge, Box, Button, Card, Center, Checkbox, Divider, Icon, Input, Label, Overlay, ProgressBar, Radio, Select, Spacer, Spinner, Stack, Switch, Textarea, Typography

#### Game Atoms (5)
- ControlButton, HealthBar, ScoreDisplay, Sprite, StateIndicator

#### Molecules (23)
- Accordion, Alert, Breadcrumb, ButtonGroup, Drawer, EmptyState, ErrorState, FormField, FormSectionHeader, InputGroup, List, LoadingState, Menu, Modal, Popover, SearchInput, Skeleton, Tabs, Toast, Tooltip

#### Game Molecules (3)
- ActionButtons, DPad, StatBadge

#### Organisms - General (13)
- CardGrid, DataTable, DetailPanel, EntityCard, EntityList, FormSection, Header, PageHeader, StatCard, Timeline, WizardContainer

#### Organisms - Game Core (17)
- BattleBoard, CanvasEffect, CastleBoard, CombatLog, DialogueBox, GameAudioProvider, GameAudioToggle, GameCanvas3D, GameHud, GameMenu, GameOverScreen, InventoryPanel, IsometricCanvas, TraitSlot, TraitStateViewer, UncontrolledBattleBoard, WorldMapBoard

#### Templates (2)
- AuthLayout, DashboardLayout

---

### ✅ ALL PHASES COMPLETE (154 components total)

#### Phase 1: Layout & Container Components (7) ✅ COMPLETE

| Component | Type | Status |
|-----------|------|--------|
| ConditionalWrapper | Atom | ✅ Ported with simplified evaluator |
| Flex | Molecule | ✅ Full flexbox control |
| SimpleGrid | Molecule | ✅ Auto-responsive grid using flexWrap |
| Container | Molecule | ✅ Max-width wrapper |
| Grid | Molecule | ✅ Flex-based grid with FlatList support |
| Spacer | Atom | ✅ Flexible spacing |
| Overlay | Atom | ✅ Modal backdrop overlay |

#### Phase 2: UI Enhancement Components (8)
Priority: HIGH

| Component | Type | Notes |
|-----------|------|-------|
| CodeBlock | Molecule | Code display with syntax highlighting |
| MarkdownContent | Molecule | Markdown renderer |
| ErrorBoundary | Molecule | Error boundary wrapper |
| FloatingActionButton | Molecule | FAB component |
| Pagination | Molecule | Pagination controls |
| SidePanel | Molecule | Side drawer panel |
| ConfirmDialog | Organism | Confirmation dialog |
| Navigation | Organism | Navigation component |

#### Phase 3: Data & Display Components (10)
Priority: MEDIUM

| Component | Type | Notes |
|-----------|------|-------|
| Chart | Organism | Data visualization |
| GraphCanvas | Organism | Graph network visualization |
| MediaGallery | Organism | Media gallery grid |
| Meter | Organism | Meter/gauge display |
| Table | Organism | Data table |
| List | Organism | Enhanced list |
| FilterGroup | Molecule | Filter UI group |
| RelationSelect | Molecule | Entity relation selector |
| RepeatableFormSection | Molecule | Dynamic form sections |
| ScaledDiagram | Molecule | Diagram scaler |

#### Phase 4: Form & Input Components (6)
Priority: MEDIUM

| Component | Type | Notes |
|-----------|------|-------|
| Form | Organism | Complete form builder |
| WizardNavigation | Molecule | Wizard step navigation |
| WizardProgress | Molecule | Wizard progress indicator |
| QuizBlock | Molecule | Quiz/interactive block |
| SignaturePad | Organism | Signature capture canvas |
| ContentRenderer | Organism | Dynamic content renderer |

#### Phase 5: Layout & Structure (8)
Priority: MEDIUM

| Component | Type | Notes |
|-----------|------|-------|
| MasterDetail | Organism | Master-detail layout |
| Split | Organism | Split pane |
| Sidebar | Organism | Sidebar navigation |
| Section | Organism | Section wrapper |
| ModalSlot | Organism | Modal slot for dynamic content |
| ToastSlot | Organism | Toast slot for notifications |
| DrawerSlot | Organism | Drawer slot |
| UISlotRenderer | Organism | Generic UI slot renderer |

#### Phase 6: Layout Organisms (5)
Priority: LOW

| Component | Type | Notes |
|-----------|------|-------|
| DashboardGrid | Organism | Dashboard grid layout |
| MasterDetail | Organism | Master-detail layout (layout/) |
| SplitPane | Organism | Resizable split pane |
| TabbedContainer | Organism | Tabbed layout container |
| LayoutPatterns | Organism | Layout pattern showcase |

#### Phase 7: Book Components (5)
Priority: LOW (if e-book features needed)

| Component | Type | Notes |
|-----------|------|-------|
| BookChapterView | Organism | Chapter content view |
| BookCoverPage | Organism | Book cover display |
| BookNavBar | Organism | Book navigation |
| BookTableOfContents | Organism | TOC component |
| BookViewer | Organism | Complete book viewer |

#### Phase 8: Game Templates (9)
Priority: MEDIUM (when games are needed)

| Component | Type | Notes |
|-----------|------|-------|
| BattleTemplate | Template | Battle page layout |
| CastleTemplate | Template | Castle page layout |
| CounterTemplate | Template | Counter app template |
| GameCanvas3DBattleTemplate | Template | 3D battle template |
| GameCanvas3DCastleTemplate | Template | 3D castle template |
| GameCanvas3DWorldMapTemplate | Template | 3D world map template |
| GameShell | Template | Game shell layout |
| GameTemplate | Template | Generic game template |
| WorldMapTemplate | Template | World map page template |
| GenericAppTemplate | Template | Generic app template |

#### Phase 9: Puzzle Game Boards (16)
Priority: LOW (when puzzle games are needed)

| Component | Type | Notes |
|-----------|------|-------|
| BuilderBoard | Organism | Puzzle builder interface |
| ClassifierBoard | Organism | Classification puzzle |
| DebuggerBoard | Organism | Debugging puzzle |
| EventHandlerBoard | Organism | Event handling puzzle |
| NegotiatorBoard | Organism | Negotiation puzzle |
| SequencerBoard | Organism | Sequence puzzle |
| SimulatorBoard | Organism | Simulation puzzle |
| StateArchitectBoard | Organism | State machine architect |
| EventLog | Organism | Event log display |
| RuleEditor | Organism | Rule editor |
| StateNode | Organism | State node component |
| TransitionArrow | Organism | Transition arrow |
| VariablePanel | Organism | Variable panel |
| CodeView | Organism | Code view |
| ActionPalette | Organism | Action palette |
| ActionTile | Organism | Action tile |
| SequenceBar | Organism | Sequence bar |

#### Phase 10: Physics Simulation (3)
Priority: LOW

| Component | Type | Notes |
|-----------|------|-------|
| SimulationCanvas | Organism | Physics sim canvas |
| SimulationControls | Organism | Physics controls |
| SimulationGraph | Organism | Physics data graph |

#### Phase 11: Specialized Views (5)
Priority: LOW

| Component | Type | Notes |
|-----------|------|-------|
| CodeViewer | Organism | Code file viewer |
| DocumentViewer | Organism | Document file viewer |
| ComponentPatterns | Organism | Component pattern showcase |
| CustomPattern | Organism | Custom pattern display |
| StateMachineView | Organism | State machine visualizer |

---

## Excluded from Porting

### Debug Tools (9)
These are developer-only components not needed in mobile:
- RuntimeDebugger
- EntitiesTab
- EventFlowTab
- GuardsPanel
- ServerBridgeTab
- TicksTab
- TraitsTab
- TransitionTimeline
- VerificationTab

### Domain-Specific Legal Components (2)
These are specific to legal/inspection domain:
- LawReferenceTooltip
- ViolationAlert

### 3D/WebGL Components (12)
These require Three.js/WebGL which doesn't apply to native mobile:
- Camera3D, Scene3D, Lighting3D
- PhysicsObject3D, ModelLoader
- FeatureRenderer3D, FeatureRenderer
- TileRenderer, UnitRenderer
- Canvas3DErrorBoundary, Canvas3DLoadingState
- JazariStateMachine (visualizer)
- OrbitalVisualization

---

## Implementation Notes

### React Native Considerations

1. **CSS Grid Alternative**: Use FlatList or ScrollView with flexWrap for grids
2. **Markdown**: Use react-native-markdown-display
3. **Charts**: Use react-native-chart-kit or victory-native
4. **Signature Pad**: Use react-native-signature-canvas
5. **Code Highlighting**: Use react-native-syntax-highlighter
6. **3D Games**: Will use Sika (Rust) native module, not WebGL

### Pattern Consistency

All components must follow:
1. **Closed Circuit Props**: isLoading, error, entity
2. **Event Bus Pattern**: UI:EVENT_NAME
3. **Theme Integration**: useTheme() hook
4. **TypeScript**: Strict typing, no `any`
5. **ESLint**: All rules enforced
6. **Display Name**: Required for all components

---

## Estimated Timeline

| Phase | Components | Est. Time |
|-------|------------|-----------|
| Phase 1: Layout | 6 | 1 day |
| Phase 2: UI Enhancement | 8 | 2 days |
| Phase 3: Data Display | 10 | 3 days |
| Phase 4: Form & Input | 6 | 2 days |
| Phase 5: Layout Structure | 8 | 2 days |
| Phase 6: Layout Organisms | 5 | 1 day |
| Phase 7: Book Components | 5 | 1 day |
| Phase 8: Game Templates | 9 | 2 days |
| Phase 9: Puzzle Boards | 16 | 4 days |
| Phase 10: Physics Sim | 3 | 1 day |
| Phase 11: Specialized | 5 | 1 day |
| **Total** | **79** | **~20 days** |

---

## Success Criteria

- [ ] All components ported with exact interface matching
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with zero errors
- [ ] Event bus integration working
- [ ] Theme integration working
- [ ] Closed circuit props pattern implemented
- [ ] Display names set for all components
