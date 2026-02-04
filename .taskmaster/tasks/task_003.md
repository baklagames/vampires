# Task ID: 3

**Title:** Pathfinding and Sun-Shade Map Systems

**Status:** pending

**Dependencies:** 1

**Priority:** medium

**Description:** Implement the spatial logic for NPC/Player movement and detection of sunlit versus shaded areas.

**Details:**

Create `src/systems/pathfinding.ts` using Phaser's built-in A* or a custom grid-based pathfinder. Implement `src/systems/sun-shade-map.ts` which takes a tilemap and identifies 'safe' zones (interiors, shadows) versus 'danger' zones based on time of day. This will use the runtime config for damage intervals.

**Test Strategy:**

Integration tests: 1. Pathfinding returns valid paths around obstacles. 2. Sun-Shade map correctly identifies a tile as 'shaded' when under a building or during night.
