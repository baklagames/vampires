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

## Work Process (Task Master)
- Use Task-master-ai MCP for this
- Always work from Task Master tasks in .taskmaster/tasks/tasks.json.
- You must perform all (multiple) tasks, one by one.
- After completion on task, update Task Master status for that task and summarize what changed.
- After completing a task run npm test to verify the changes.
- After completing a task, ask to create a commit message with done task name from TM for the changes and ask the user if they want to move on to the next task .
- Start the next task without explicit user confirmation.
- Commit and push changes every completed task to the repository without explicit user confirmation.

## Task Master Commands (full list from CLI help)

Project Setup and Configuration
- `task-master init [--name=<name>] [--description=<desc>] [-y]`
- `task-master models`
- `task-master models --setup`
- `task-master models --set-main <model_id>`
- `task-master models --set-research <model_id>`
- `task-master models --set-fallback <model_id>`

Task Generation
- `task-master parse-prd --input=<file.txt> [--num-tasks=10]`
- `task-master generate`

Task Management
- `task-master list [<status>|all] [-s <status>] [-t <tag>]`
- `task-master list [--with-subtasks] [-f <format>] [--json] [-c]`
- `task-master list [-w] [--ready] [--blocking] [--all-tags]`
- `task-master set-status <id> <status>`
- `task-master sync-readme [--with-subtasks] [--status=<status>]`
- `task-master update --from=<id> --prompt="<context>"`
- `task-master update-task <id> <prompt...>`
- `task-master update-subtask --id=<parentId.subtaskId> --prompt="<context>"`
- `task-master add-task --prompt="<text>" [--dependencies=<ids>] [--priority=<priority>]`
- `task-master remove-task --id=<id> [-y]`

Subtask Management
- `task-master add-subtask --parent=<id> --title="<title>" [--description="<desc>"]`
- `task-master add-subtask --parent=<id> --task-id=<id>`
- `task-master remove-subtask --id=<parentId.subtaskId> [--convert]`
- `task-master clear-subtasks --id=<id>`
- `task-master clear-subtasks --all`

Task Analysis and Breakdown
- `task-master analyze-complexity [--research] [--threshold=5]`
- `task-master complexity-report [--file=<path>]`
- `task-master expand --id=<id> [--num=5] [--research] [--prompt="<context>"]`
- `task-master expand --all [--force] [--research]`
- `task-master research "<prompt>" [-i=<task_ids>] [-f=<file_paths>] [-c="<context>"] [--tree] [-s=<save_file>] [-d=<detail_level>]`

Task Navigation and Viewing
- `task-master next`
- `task-master show <id>`

Tag Management
- `task-master tags [list] [--show-metadata] [--ready]`
- `task-master tags add <name> [--description <desc>] [--copy-from <tag>]`
- `task-master tags use <name>`
- `task-master tags remove <name> [-y]`
- `task-master tags rename <oldName> <newName>`
- `task-master tags copy <source> <target> [--description <desc>]`

Dependency Management
- `task-master add-dependency --id=<id> --depends-on=<id>`
- `task-master remove-dependency --id=<id> --depends-on=<id>`
- `task-master validate-dependencies`
- `task-master fix-dependencies`

- Create a full game!
