# AGENTS

## Project Context
- Project: mobile-first (PWA-friendly) vampire stealth game. Real game, not proto
- Primary docs: PRD.md, PRD_TM.md, PLAN.md, TECH_RULES.md, DESIGN_SYSTEM_RULES.md.
- Core engine: Phaser-based scenes and controllers (see task definitions in .taskmaster/tasks/tasks.json).

## Game
- People moving accross the city. Sometimes they stopping, sometime moving.
- Type of personages: 
  - people: children, adults, old people.
  - players - vampire
  - policemans
- Children move faster, but have better blood
- Adults move normally and have normal blood
- Old people move slower, but have worse blood
- You need create tilemap districts with: roads, buildings, parks, trees, and other natural elements. 
- In daylight very sunny, people are more active and move faster. 
- In darkness, not many people, but more policemans
- Create a full game!

## Key Specification (must follow)
- Single source of truth for balance is YAML config loaded at boot and stored as a typed, immutable runtime config.
- No gameplay constants in code. Any gameplay number must come from config (timings, multipliers, radii, damages, counts, etc.).
- Design system tokens are the only allowed layout constants (spacing, radius, typography, color roles).
- Config load order: load YAML -> validate schema -> apply defaults -> expose immutable runtime config.
- Validation behavior is config-driven (player name rules, onInvalid behavior, etc.).
- Each scene only consumes public controllers (DayNightController, PanicBubbleController, etc.).
- Performance constraints are config-driven (maxActiveNpcs per scene, density multipliers, etc.).
- Tuning must be reproducible by swapping YAML files (no hidden overrides).
- Overlay rendering budget: overlays must be lightweight layers (no expensive realtime lighting).
- Telemetry minimal: events are queued locally; sending can be deferred and disabled in config if needed.
