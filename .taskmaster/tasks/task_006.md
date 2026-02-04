# Task ID: 6

**Title:** One-Handed Tap-to-Move and Stealth Interaction

**Status:** pending

**Dependencies:** 1, 3

**Priority:** high

**Description:** Implement the primary mobile control scheme for movement, target selection, and feeding.

**Details:**

Create the input handling logic in a base player class. Tapping empty space moves the player. Tapping an NPC selects them as a target (showing a TargetRingFlash). Tapping the target again while in range initiates the 'Bite' (feeding) action. All timings and ranges must come from `RuntimeConfig`.

**Test Strategy:**

Manual testing in mobile emulator: 1. Tap to move works. 2. NPC selection/deselection via tap works. 3. Feeding logic triggers correctly when within the YAML-defined range.
