# Task ID: 5

**Title:** Panic Bubble and Police Response Logic

**Status:** pending

**Dependencies:** 1, 4

**Priority:** medium

**Description:** Develop the local panic mechanics and the resulting police spawning system.

**Details:**

Implement `src/controllers/panic-bubble.ts` to manage circular areas of effect around incidents. Implement `src/controllers/police-response.ts` to spawn police NPCs within or near the panic bubble. Use config for bubble radius, duration, and the 'night x2' multiplier for police response density.

**Test Strategy:**

Simulate an incident and verify: 1. Panic state only spreads to NPCs within the radius. 2. Police spawn count increases correctly during Night phase vs Day phase.
