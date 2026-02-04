# Design System Rules (EN)

1. No ad-hoc UI: every screen uses only DS components listed in the PRD.
2. Thumb-first default: primary actions live in BottomActionBar at the bottom; top UI is informational only.
3. Readability > decoration: overlays and indicators must remain legible on small screens.
4. Token-only layout: spacing, radii, typography sizes come strictly from DS tokens.
5. Color roles only: UI uses semantic roles (Background/Surface/etc), no hardcoded colors in components.
6. Consistent interaction patterns:
   - Primary CTA = ButtonPrimary
   - Secondary/back = ButtonSecondary
   - Icon-only actions = ButtonIcon
   - Overlays/menus = ModalSheet
7. Validation states are standardized: TextField must support valid/invalid/help states; error messaging via Toast when needed.
8. Game overlays are DS-owned: TargetRingFlash/Outline, PanicAreaIndicator, SunDangerOverlay are treated as DS “game overlay components” with config-driven timings/radii where applicable.
