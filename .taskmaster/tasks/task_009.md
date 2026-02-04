# Task ID: 9

**Title:** UI Components and Game Overlays (S1-S9 HUD)

**Status:** pending

**Dependencies:** 2, 7

**Priority:** medium

**Description:** Create the Design System-based UI components and in-game overlays like the Blood bar, Phase indicator, and Panic flash.

**Details:**

Implement components in `src/ui/components/` and `src/ui/overlays/`. Include `BottomActionBar`, `TimeOfDayIndicator`, and full-screen flashes for damage/panic. These must use the tokens defined in Task 2. Use Phaser DOM elements or React/Vue overlay if specified by the stack.

**Test Strategy:**

Visual check: 1. UI elements scale for mobile portrait. 2. Phase indicator updates when Day/Night controller changes state. 3. Panic overlay flashes when the player is in a Panic Bubble.
