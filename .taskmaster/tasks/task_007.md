# Task ID: 7

**Title:** Town Scene: Core World Implementation

**Status:** pending

**Dependencies:** 4, 5, 6

**Priority:** high

**Description:** Assemble the primary game world (Town) with NPCs, tilemaps, and active controllers.

**Details:**

Implement `src/scenes/town.ts`. Integrate the Tilemap, Player character, NPC pooling, and the DayNight/Panic/Police controllers. This scene acts as the main gameplay loop container where 'move -> bite -> panic -> escape' occurs.

**Test Strategy:**

Playtest the full loop: Start in town, find NPC, bite, trigger panic bubble, observe police spawning, and escape to a safe zone.
