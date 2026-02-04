# Task Master PRD — Vampire Stealth Game (PWA)

Below is an RPG (Repository Planning Graph) PRD for Task Master based on all project `.md` files. It separates “what we build” (capabilities) from “how we organize it” (structure), then connects them with explicit dependencies.

---

<overview>
<instruction>
Start with the problem, not the solution. Be specific about:
- What pain point exists?
- Who experiences it?
- Why existing solutions don't work?
- What success looks like (measurable outcomes)?
</instruction>

## Problem Statement
The goal is to ship a launch-ready MVP of a mobile (PWA) vampire stealth game: a full gameplay loop on mobile web with one-handed point/target/cover selection, local panic, and a day/night cycle. The current risk is losing focus on the playable end result by getting stuck on infrastructure (config/DS). We need a structured PRD that subordinates config and design system work to the primary goal: a working mobile gameplay loop and the full MVP screen set.【F:PRD.md†L1-L322】【F:TECH_RULES.md†L1-L10】【F:DESIGN_SYSTEM_RULES.md†L1-L8】

## Target Users
- Mobile casual–midcore players and pixel-art fans who want short sessions and a strong stealth loop.【F:PRD.md†L34-L64】
- The development team that needs a clear, dependency-aware plan for systems and UI, without gameplay magic numbers and with YAML-driven tuning.【F:TECH_RULES.md†L1-L10】【F:PRD.md†L1-L244】

## Success Metrics
- A playable mobile-web MVP: the loop “move → select target → bite → panic → police response → escape/hide” works in real gameplay.【F:PRD.md†L84-L214】
- All screens S0–S10 are implemented and reachable via navigation.【F:PRD.md†L214-L322】
- 100% of gameplay parameters are configurable via YAML without code changes.【F:PRD.md†L1-L244】【F:TECH_RULES.md†L1-L10】
- All screens are built only from DS components (0 ad-hoc UI).【F:PRD.md†L244-L322】【F:DESIGN_SYSTEM_RULES.md†L1-L8】
- Local panic and police response are constrained to the incident area.【F:PRD.md†L152-L186】
- Day/night affects NPC density and police behavior per config.【F:PRD.md†L122-L214】
</overview>

---

<functional-decomposition>
<instruction>
Now think about CAPABILITIES (what the system DOES), not code structure yet.
</instruction>

## Capability Tree

### Capability: Configuration and validation
Provides a single source of balance (YAML), validation, and immutable runtime configuration.

#### Feature: YAML config loading
- **Description**: Loads config at boot and produces a runtime object.
- **Inputs**: YAML file, game version.
- **Outputs**: Runtime config (immutable).
- **Behavior**: Order: load → validate → defaults → expose.【F:TECH_RULES.md†L1-L10】【F:PRD.md†L244-L322】

#### Feature: Player name validation rules
- **Description**: Applies player name rules.
- **Inputs**: Name string, regex/length/behavior rules.
- **Outputs**: Validated name or error.
- **Behavior**: onInvalid behavior is config-driven.【F:PRD.md†L70-L110】【F:TECH_RULES.md†L1-L10】

### Capability: Core stealth gameplay
Core mechanics for movement, target selection, feeding, and stealth.

#### Feature: Tap-to-move, Tap-to-target, hide selection
- **Description**: One-handed control via selecting a point, target, or cover (no finger sliding).
- **Inputs**: Tap coordinates, selected NPC, selected cover.
- **Outputs**: Movement trajectory, target state, cover state.
- **Behavior**: Target highlight timing from config; cancel by tapping empty space or tapping the target again.【F:PRD.md†L112-L176】

#### Feature: Feeding and risk
- **Description**: Bite at range; vulnerability while feeding.
- **Inputs**: NPC within bite range.
- **Outputs**: Blood gain, risk increase.
- **Behavior**: Interruptible; parameters from YAML.【F:PRD.md†L176-L214】

### Capability: Day/night, sun, and safe zones
Day cycle, sunlight effects, and safety zones.

#### Feature: Day/Dusk/Night/Dawn cycle
- **Description**: Phase changes that impact NPCs and police.
- **Inputs**: Cycle timer, density multipliers.
- **Outputs**: Active phase.
- **Behavior**: Visual warnings in transition phases.【F:PRD.md†L122-L214】

#### Feature: Sun and shade
- **Description**: Daytime damage on sunlit tiles.
- **Inputs**: Sun/shade map, damage timer.
- **Outputs**: Health change/death.
- **Behavior**: Safe zones are shade/interiors/castle.【F:PRD.md†L132-L214】

### Capability: Local panic and police
Local consequences and response within the incident area.

#### Feature: Panic Bubble
- **Description**: Localizes panic around an incident.
- **Inputs**: Incident coordinates, radius, duration.
- **Outputs**: NPC states within the area.
- **Behavior**: Panic is not global; it is radius-bound.【F:PRD.md†L152-L186】

#### Feature: Police Response
- **Description**: Police spawn/response is local.
- **Inputs**: Heat level, night multiplier.
- **Outputs**: Number of responding police NPCs.
- **Behavior**: Night is x2 per config.【F:PRD.md†L162-L214】

### Capability: Scenes and navigation
Game scenes, transitions, and screens.

#### Feature: Core scenes
- **Description**: Town, Interior, Castle.
- **Inputs**: Game state.
- **Outputs**: Active scene.
- **Behavior**: Respawn in the castle after death.【F:PRD.md†L214-L322】

#### Feature: Screen navigation S0–S10
- **Description**: Complete MVP screen set and transitions.
- **Inputs**: Player actions.
- **Outputs**: Screen/overlay.
- **Behavior**: Navigation strictly follows the list. 【F:PRD.md†L214-L322】

### Capability: Design system (DS)
Unified token and component set for UI and overlays.

#### Feature: Tokens and color roles
- **Description**: Tokens for spacing/radius/typography and color roles.
- **Inputs**: DS rules.
- **Outputs**: Token set.
- **Behavior**: Only tokens used for layout code.【F:PRD.md†L214-L322】【F:DESIGN_SYSTEM_RULES.md†L1-L8】

#### Feature: UI components and overlays
- **Description**: Component catalog and game overlays.
- **Inputs**: DS component list.
- **Outputs**: Component set.
- **Behavior**: Only DS components on screens. 【F:PRD.md†L214-L322】【F:DESIGN_SYSTEM_RULES.md†L1-L8】
</functional-decomposition>

---

<structural-decomposition>
<instruction>
NOW think about code organization. Map capabilities to actual file/folder structure.
</instruction>

## Repository Structure

```
project-root/
├── src/
│   ├── config/                 # Config and validation
│   │   ├── loader.ts
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── controllers/            # Gameplay controllers
│   │   ├── day-night.ts
│   │   ├── panic-bubble.ts
│   │   ├── police-response.ts
│   │   ├── detection.ts
│   │   └── index.ts
│   ├── scenes/                 # Phaser scenes
│   │   ├── town.ts
│   │   ├── interior.ts
│   │   ├── castle.ts
│   │   └── index.ts
│   ├── ui/                     # DS components
│   │   ├── components/
│   │   ├── overlays/
│   │   └── tokens.ts
│   └── systems/                # Shared game systems
│       ├── pathfinding.ts
│       ├── sun-shade-map.ts
│       └── save-system.ts
├── assets/
├── tests/
└── docs/
```

## Module Definitions

### Module: config
- **Maps to capability**: Configuration and validation
- **Responsibility**: YAML loading, validation, runtime config.
- **Exports**:
  - `loadConfig()` — loads and validates YAML.
  - `getRuntimeConfig()` — immutable config.

### Module: controllers
- **Maps to capability**: Day/night, panic, police, detection
- **Responsibility**: System logic and rules.
- **Exports**:
  - `DayNightController`
  - `PanicBubbleController`
  - `PoliceResponseController`

### Module: scenes
- **Maps to capability**: Scenes and navigation
- **Responsibility**: Scene rendering and base logic.
- **Exports**:
  - `TownScene`, `InteriorScene`, `CastleScene`

### Module: ui
- **Maps to capability**: Design system
- **Responsibility**: DS components, overlays, tokens.
- **Exports**:
  - `ButtonPrimary`, `BottomActionBar`, `TimeOfDayIndicator`, `TargetRingFlash`, etc.
</structural-decomposition>

---

<dependency-graph>
<instruction>
Define explicit dependencies between modules. This creates the topological order for task execution.
</instruction>

## Dependency Chain

### Foundation Layer (Phase 0)
No dependencies - these are built first.

- **config**: YAML loading/validation and runtime config.
- **ui/tokens**: DS tokens and color roles.

### Systems Layer (Phase 1)
- **ui/components**: Depends on [ui/tokens]
- **ui/overlays**: Depends on [ui/tokens, config]
- **systems/pathfinding**: Depends on [config]
- **systems/sun-shade-map**: Depends on [config]

### Controllers Layer (Phase 2)
- **controllers/day-night**: Depends on [config]
- **controllers/panic-bubble**: Depends on [config]
- **controllers/police-response**: Depends on [config, controllers/panic-bubble]
- **controllers/detection**: Depends on [config, systems/pathfinding]

### Scenes Layer (Phase 3)
- **scenes/town**: Depends on [controllers/*, systems/*, ui/components, ui/overlays]
- **scenes/interior**: Depends on [controllers/*, systems/*, ui/components, ui/overlays]
- **scenes/castle**: Depends on [ui/components, config]

### UI Navigation Layer (Phase 4)
- **screens S0–S10**: Depends on [ui/components, scenes/*, config]
</dependency-graph>

---

<implementation-roadmap>
<instruction>
Turn the dependency graph into concrete development phases.
</instruction>

## Development Phases

### Phase 0: Foundation
**Goal**: Single source of balance and DS tokens.

**Entry Criteria**: Repository ready; PRD/Tech/DS requirements fixed.

**Tasks**:
- [ ] YAML config + loading/validation (depends on: none)
  - Acceptance criteria: runtime config is immutable and used across systems.
  - Test strategy: unit tests for schema and validation.
- [ ] DS tokens and color roles (depends on: none)
  - Acceptance criteria: all layout constants come from DS tokens.

**Exit Criteria**: Runtime config and DS tokens are available without errors.

**Delivers**: Foundations for gameplay and UI. 【F:TECH_RULES.md†L1-L10】【F:DESIGN_SYSTEM_RULES.md†L1-L8】

---

### Phase 1: Systems & DS Components
**Goal**: Base systems + DS components.

**Entry Criteria**: Phase 0 complete.

**Tasks**:
- [ ] DS components (depends on: [DS tokens])
- [ ] DS overlays (TargetRingFlash/Outline, Panic, Sun) (depends on: [DS tokens, config])
- [ ] Pathfinding and SunShadeMap (depends on: [config])

**Exit Criteria**: Components and overlays are available in UI, system modules ready.

**Delivers**: UI layer and world infrastructure. 【F:PRD.md†L214-L322】

---

### Phase 2: Controllers
**Goal**: Implement key rules (day/night, panic, police).

**Entry Criteria**: Phase 1 complete.

**Tasks**:
- [ ] DayNightController (depends on: [config])
- [ ] PanicBubbleController (depends on: [config])
- [ ] PoliceResponseController (depends on: [config, PanicBubbleController])
- [ ] DetectionController (depends on: [config, pathfinding])

**Exit Criteria**: Controllers work and rely on YAML.

**Delivers**: Stealth logic, panic, and day/night cycle. 【F:PRD.md†L112-L214】

---

### Phase 3: Scenes
**Goal**: Town/Interior/Castle scenes with base logic.

**Entry Criteria**: Phase 2 complete.

**Tasks**:
- [ ] TownScene (depends on: [controllers, systems, ui])
- [ ] InteriorScene (depends on: [controllers, systems, ui])
- [ ] CastleScene (depends on: [ui, config])

**Exit Criteria**: Player can traverse scenes and respawn in the castle.

**Delivers**: Core gameplay loop. 【F:PRD.md†L214-L322】

---

### Phase 4: Screens and navigation
**Goal**: S0–S10 screen structure per PRD.

**Entry Criteria**: Phase 3 complete.

**Tasks**:
- [ ] Screens S0–S10 (depends on: [ui components, scenes, config])
- [ ] Navigation and overlays (depends on: [screens, ui overlays])

**Exit Criteria**: Full MVP UI per screen list.

**Delivers**: Playable MVP with menus, settings, and game screens. 【F:PRD.md†L214-L322】
</implementation-roadmap>

---

<test-strategy>
<instruction>
Define how testing will be integrated throughout development (TDD approach).
</instruction>

## Test Pyramid

```
        /\
       /E2E\       ← 10% (End-to-end)
      /------\
     /Integration\ ← 25% (Module interactions)
    /------------\
   /  Unit Tests  \ ← 65% (Fast, isolated)
  /----------------\
```

## Coverage Requirements
- Line coverage: 80%
- Branch coverage: 70%
- Function coverage: 80%
- Statement coverage: 80%

## Critical Test Scenarios

### Config Loader
**Happy path**:
- Valid YAML loads and yields runtime config.
- Expected: runtime config is immutable.

**Edge cases**:
- Missing fields with defaults.
- Expected: defaults applied.

**Error cases**:
- Invalid name regex.
- Expected: validation error.

### Day/Night Cycle
**Happy path**:
- Phase transitions by timer.
- Expected: correct UI indicators.

**Integration points**:
- NPC density changes by multiplier.
- Expected: nightMultiplier applies.【F:PRD.md†L122-L214】

### Panic Bubble + Police
**Happy path**:
- Incident triggers local panic.
- Expected: panic is radius-limited.

**Integration points**:
- Police respond inside bubble.
- Expected: local response and night x2.【F:PRD.md†L152-L214】
</test-strategy>

---

<architecture>
<instruction>
Describe technical architecture, data models, and key design decisions.
</instruction>

## System Components
- Phaser scenes (Town/Interior/Castle).
- Controllers: DayNight, PanicBubble, PoliceResponse, Detection.
- UI layer: DS components + game overlays.
- Systems: pathfinding, sun/shade map, save system.

## Data Models
- RuntimeConfig (from YAML, immutable).
- NPC state: Calm → Suspicious → Alarmed → Panic.
- Heat levels and decay.

## Technology Stack
- Web (PWA), Phaser for rendering, YAML for configuration.【F:PRD.md†L214-L244】

**Decision: YAML as balance source**
- **Rationale**: Full control without code changes.
- **Trade-offs**: Requires strict validation at load.
- **Alternatives considered**: JSON, remote config (post-MVP).【F:TECH_RULES.md†L1-L10】【F:PRD.md†L244-L322】
</architecture>

---

<risks>
<instruction>
Identify risks that could derail development and how to mitigate them.
</instruction>

## Technical Risks
**Risk**: Enforcing “no gameplay magic numbers in code.”
- **Impact**: High
- **Likelihood**: Medium
- **Mitigation**: Linters and review, config checks.
- **Fallback**: Temporary build gate when violations are found.【F:TECH_RULES.md†L1-L10】【F:PLAN.md†L13-L46】

**Risk**: Mobile performance issues from overlays/effects.
- **Impact**: Medium
- **Likelihood**: Medium
- **Mitigation**: Lightweight layers, no realtime lighting.【F:TECH_RULES.md†L9-L10】【F:PRD.md†L214-L244】

## Dependency Risks
- Phaser and PWA constraints may limit features (e.g., lighting).【F:PRD.md†L214-L244】

## Scope Risks
- MVP creep from post-MVP features (multiplayer, huge world, heavy RPG).【F:PRD.md†L52-L64】
</risks>

---

<appendix>
## References
- PRD vFinal — Mobile Web Vampire Stealth Game
- Tech Rules (EN)
- Design System Rules (EN)
- Work Plan

## Glossary
- **DS**: Design System
- **PWA**: Progressive Web App
- **Panic Bubble**: localized panic area

## Open Questions
- MVP analytics and event requirements (minimal set).【F:TECH_RULES.md†L9-L10】
- Performance thresholds and target FPS on mobile.
</appendix>

---

<task-master-integration>
# How Task Master Uses This PRD

When you run `task-master parse-prd PRD_TASK_MASTER.md`, the parser:

1. **Extracts capabilities** → Main tasks
2. **Extracts features** → Subtasks
3. **Parses dependencies** → Task dependencies
4. **Orders by phases** → Task priorities
5. **Uses test strategy** → Test generation context
</task-master-integration>
