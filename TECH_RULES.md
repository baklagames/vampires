# Tech Rules (EN)

1. Single source of truth for balance: YAML config. Code reads config at boot and stores a typed runtime config object.
2. No gameplay constants in code: any number affecting gameplay must come from config (timings, multipliers, radii, damages, counts, etc).
3. DS tokens exception: only spacing/radius/typography/color roles are allowed as constants in code (layout only).
4. Config load order: load YAML → validate schema → apply defaults (if any) → expose immutable runtime config.
5. Validation behavior is config-driven: player name rules, onInvalid behavior, etc.
6. Phaser scene boundaries: each scene only consumes public controllers (DayNightController, PanicBubbleController, etc).
7. Performance constraints are config-driven: maxActiveNpcs per scene, density multipliers, etc.
8. Deterministic tuning: any tuning change must be reproducible by swapping YAML files (no hidden overrides).
9. Overlay rendering budget: overlays must be lightweight layers (no expensive realtime lighting).
10. Telemetry minimal: events are queued locally; sending can be deferred and disabled in config if needed.
