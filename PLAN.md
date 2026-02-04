# Work Plan

Below is the implementation plan captured as a working backlog with priorities and expected artifacts. The plan starts with design system formation.

## P0 — Blocking (design system and rules)
1. **Design system foundation (DS tokens + color roles).**
   - **Artifacts:**
     - Token specification (spacing/radius/typography/color roles) as the single source of layout constants.
     - Mapping table of color roles (Background/Surface/TextPrimary, etc.).

2. **DS component catalog (required set).**
   - **Artifacts:**
     - Component registry (PixelCard, ButtonPrimary/Secondary/Icon, BottomActionBar, HUDChip, ProgressBar, HeatIndicator, TimeOfDayIndicator, Toast, ModalSheet, ListItem, TextField, ToggleSwitch, Slider, TooltipHelp).
     - Usage notes and variants.

3. **DS overlays as components (Target/Panic/Sun).**
   - **Artifacts:**
     - Overlay component specification (TargetRingFlash/Outline, PanicAreaIndicator, SunDangerOverlay, TapMarker).
     - Links to config timings/radii.

4. **Standardized UI patterns and validation.**
   - **Artifacts:**
     - Rules for Primary/Secondary/Icon/ModalSheet.
     - TextField states (valid/invalid/help) and Toast error rules.

5. **Create linters for the program code before development.**
   - **Artifacts:**
     - Implemented linting ruleset (style, naming, formatting, and architecture checks).
     - Tooling setup (selected linter(s), configuration file locations, CI/local run commands).

## P1 — High priority (config and architecture)
6. **YAML config as the single source of balance.**
   - **Artifacts:**
     - YAML config structure (schema outline).
     - Rules document: “no gameplay magic numbers in code”.

7. **Config loading/validation pipeline.**
   - **Artifacts:**
     - Order specification: load → validate → defaults → runtime config (immutable).
     - Player name validation rules table.

8. **Architecture skeleton for scenes and controllers.**
   - **Artifacts:**
     - Scene map (Town/Interior/Castle) and controller list (DayNight, PanicBubble, PoliceResponse, etc.).
     - Boundaries of scene/controller responsibilities.

## P2 — Medium priority (screen skeletons)
9. **Screen specifications (S0–S10) based on DS.**
   - **Artifacts:**
     - Screen wireframes mapped to DS components.
     - Navigation diagram.

10. **HUD and game UI layers.**
   - **Artifacts:**
     - HUD specification (TimeOfDay, Heat, blood/health, BottomActionBar).
     - Overlay list and behavior.

## P3 — Production planning
11. **Development plan.**
    - **Artifacts:**
      - Phased implementation plan with milestones, dependencies, and delivery dates.

12. **MVP sprint plan.**
    - **Artifacts:**
      - Sprint breakdown with priority order: DS → core loop → day/night → polish.

13. **MVP acceptance checklist.**
    - **Artifacts:**
      - Readiness checklist (tap-controls, YAML config, local panic, day/night, DS strictness, etc.).
