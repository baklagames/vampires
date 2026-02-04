# Task ID: 8

**Title:** Interior and Castle Scenes with Respawn Logic

**Status:** pending

**Dependencies:** 7

**Priority:** medium

**Description:** Implement secondary scenes and the transition logic between them, including the death/respawn flow.

**Details:**

Create `src/scenes/interior.ts` and `src/scenes/castle.ts`. The Castle serves as the safe-zone/respawn point. Use a scene manager to handle transitions. If health reaches zero in the Town or Sun, the player must respawn in the Castle scene.

**Test Strategy:**

Verify scene transitions: 1. Entering a building switches to InteriorScene. 2. Dying in Town correctly triggers transition to CastleScene.
