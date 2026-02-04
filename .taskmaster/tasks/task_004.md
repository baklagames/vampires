# Task ID: 4

**Title:** Day/Night Cycle Controller

**Status:** pending

**Dependencies:** 1

**Priority:** medium

**Description:** Implement the logic for transitioning between Day, Dusk, Night, and Dawn phases.

**Details:**

Create `src/controllers/day-night.ts`. It should manage a global timer and update the current 'Phase'. It triggers events that other systems (like NPC density or Police Response) listen to. Transitions should provide visual warnings (Dusk/Dawn) as per PRD.

**Test Strategy:**

Unit tests for state transitions: Day -> Dusk -> Night -> Dawn -> Day. Verify multipliers for NPC density are correctly calculated based on the active phase.
