import { z } from "zod";

const OnInvalidSchema = z.enum(["reject", "strip", "replace"]);

const withEmptyDefault = <T extends z.ZodTypeAny>(schema: T) =>
  (schema as z.ZodTypeAny).default({}) as z.ZodDefault<T>;

const strictObject = <T extends z.ZodRawShape>(shape: T) =>
  z.object(shape).strict();

const defaultObject = <T extends z.ZodRawShape>(shape: T) =>
  withEmptyDefault(strictObject(shape));

const PlayerNameSchema = defaultObject({
  random: defaultObject({
    enabled: z.boolean().default(true),
    length: z.number().int().min(1).default(8),
    charset: z.string().default("A-Za-z0-9"),
  }),
  manualInput: defaultObject({
    enabled: z.boolean().default(true),
    regex: z.string().default("^[A-Za-z0-9]{3,12}$"),
    onInvalid: OnInvalidSchema.default("reject"),
    replaceChar: z.string().min(1).max(1).default("_"),
  }),
});

const PlayerStatsSchema = defaultObject({
  maxHealth: z.number().min(1).default(100),
  maxBlood: z.number().min(0).default(100),
  moveSpeed: z.number().min(0).default(1.0),
});

const PlayerBloodSchema = defaultObject({
  startingBlood: z.number().min(0).default(50),
  loseOnDeathFraction: z.number().min(0).max(1).default(0.5),
});

const PlayerActionsSchema = defaultObject({
  biteCooldownSeconds: z.number().min(0).default(0.2),
  escapeCooldownSeconds: z.number().min(0).default(6),
  hideCooldownSeconds: z.number().min(0).default(4),
});

const ControlsSchema = defaultObject({
  tapToMove: defaultObject({
    enabled: z.boolean().default(true),
    arrivalThresholdTiles: z.number().min(0).default(0.1),
  }),
  tapToTarget: defaultObject({
    enabled: z.boolean().default(true),
  }),
  targetRing: defaultObject({
    flashMs: z.number().int().min(0).default(200),
  }),
  tapMarker: defaultObject({
    enabled: z.boolean().default(false),
  }),
});

const DayNightSchema = withEmptyDefault(
  strictObject({
    cycle: defaultObject({
      totalSeconds: z.number().min(1).default(420),
      daySeconds: z.number().min(0).default(160),
      duskSeconds: z.number().min(0).default(40),
      nightSeconds: z.number().min(0).default(160),
      dawnSeconds: z.number().min(0).default(60),
    }),
    npcDensity: defaultObject({
      dayMultiplier: z.number().min(0).default(1.0),
      nightMultiplier: z.number().min(0).default(0.45),
    }),
  }).superRefine((value, ctx) => {
    if (!value.cycle) {
      return;
    }

    const {
      daySeconds,
      duskSeconds,
      nightSeconds,
      dawnSeconds,
      totalSeconds,
    } = value.cycle;

    if (
      daySeconds === undefined ||
      duskSeconds === undefined ||
      nightSeconds === undefined ||
      dawnSeconds === undefined ||
      totalSeconds === undefined
    ) {
      return;
    }

    const sum =
      daySeconds +
      duskSeconds +
      nightSeconds +
      dawnSeconds;
    if (totalSeconds !== sum) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dayNight.cycle.totalSeconds must equal the sum of phase seconds.",
        path: ["cycle", "totalSeconds"],
      });
    }
  }),
);

const SunSchema = defaultObject({
  enabled: z.boolean().default(true),
  damagePerSecond: z.number().min(0).default(12),
  graceMs: z.number().int().min(0).default(150),
  safeZones: defaultObject({
    indoors: z.boolean().default(true),
    castle: z.boolean().default(true),
  }),
});

const PanicSchema = defaultObject({
  bubble: defaultObject({
    radiusTiles: z.number().min(0).default(10),
    durationSeconds: z.number().min(0).default(25),
  }),
  witness: defaultObject({
    callPoliceDelaySeconds: z.number().min(0).default(2.0),
    panicSpreadWithinBubble: z.boolean().default(true),
  }),
});

const HeatSchema = defaultObject({
  levels: z.number().int().min(1).default(6),
  increase: defaultObject({
    onBite: z.number().min(0).default(1),
    onKill: z.number().min(0).default(2),
    onWitnessCall: z.number().min(0).default(1),
    perSecondInPanic: z.number().min(0).default(0.2),
    perSecondInChase: z.number().min(0).default(0.3),
  }),
  decay: defaultObject({
    enabled: z.boolean().default(true),
    secondsToStartDecay: z.number().min(0).default(6),
    decayPerSecond: z.number().min(0).default(0.6),
  }),
});

const HumansSchema = defaultObject({
  base: defaultObject({
    walkSpeed: z.number().min(0).default(1.0),
    bloodQuality: z.number().min(0).default(1.0),
  }),
  variants: defaultObject({
    adultMale: defaultObject({
      speedMultiplier: z.number().min(0).default(1.0),
      bloodQualityMultiplier: z.number().min(0).default(1.0),
    }),
    adultFemale: defaultObject({
      speedMultiplier: z.number().min(0).default(1.0),
      bloodQualityMultiplier: z.number().min(0).default(1.0),
    }),
    kid: defaultObject({
      speedMultiplier: z.number().min(0).default(1.35),
      bloodQualityMultiplier: z.number().min(0).default(1.25),
    }),
    grandma: defaultObject({
      speedMultiplier: z.number().min(0).default(0.75),
      bloodQualityMultiplier: z.number().min(0).default(0.8),
    }),
    grandpa: defaultObject({
      speedMultiplier: z.number().min(0).default(0.75),
      bloodQualityMultiplier: z.number().min(0).default(0.8),
    }),
  }),
});

const NpcSchema = defaultObject({
  behavior: defaultObject({
    idleWanderRadiusTiles: z.number().min(0).default(6),
    idlePauseSeconds: z.number().min(0).default(2),
    fleeSpeedMultiplier: z.number().min(0).default(1.4),
    panicDurationSeconds: z.number().min(0).default(8),
  }),
  detection: defaultObject({
    visionRangeTiles: z.number().min(0).default(7),
    visionConeDegrees: z.number().min(0).max(360).default(110),
    hearingRangeTiles: z.number().min(0).default(6),
    suspicionSeconds: z.number().min(0).default(1.5),
    alarmDurationSeconds: z.number().min(0).default(6),
    lineOfSightGraceSeconds: z.number().min(0).default(0.5),
  }),
});

const PoliceSchema = defaultObject({
  enabled: z.boolean().default(true),
  spawn: defaultObject({
    baseCount: z.number().int().min(0).default(2),
    responseCountPerHeat: z.number().int().min(0).default(1),
    nightMultiplier: z.number().min(0).default(2.0),
  }),
  vision: defaultObject({
    dayRangeTiles: z.number().min(0).default(9),
    nightRangeTiles: z.number().min(0).default(6),
  }),
  damage: defaultObject({
    bulletDamage: z.number().min(0).default(10),
    fireRatePerSecond: z.number().min(0).default(0.8),
  }),
  behavior: defaultObject({
    patrolSpeed: z.number().min(0).default(1.2),
    chaseSpeed: z.number().min(0).default(1.8),
    responseDelaySeconds: z.number().min(0).default(3),
    searchDurationSeconds: z.number().min(0).default(8),
    despawnSeconds: z.number().min(0).default(20),
    spawnRadiusJitterFraction: z.number().min(0).default(0.6),
    spawnMaxAttempts: z.number().int().min(1).default(20),
  }),
});

const FeedingSchema = defaultObject({
  bite: defaultObject({
    rangeTiles: z.number().min(0).default(1.0),
    baseDurationSeconds: z.number().min(0).default(2.4),
    interruptible: z.boolean().default(true),
  }),
  reward: defaultObject({
    baseBloodGain: z.number().min(0).default(20),
  }),
});

const PerformanceSchema = defaultObject({
  maxActiveNpcs: defaultObject({
    town: z.number().int().min(0).default(40),
    interior: z.number().int().min(0).default(12),
  }),
});

const UiSchema = defaultObject({
  timing: defaultObject({
    splashSeconds: z.number().min(0).default(1.5),
    toastSeconds: z.number().min(0).default(2.5),
    phaseWarningFlashMs: z.number().int().min(0).default(600),
    deathOverlaySeconds: z.number().min(0).default(1.0),
  }),
});

const UpgradesSchema = defaultObject({
  enabled: z.boolean().default(true),
  items: z
    .array(
      defaultObject({
        id: z.string().min(1).default("upgrade-1"),
        name: z.string().min(1).default("Shadow Step"),
        description: z.string().min(1).default("Short dash to evade"),
        cost: z.number().min(0).default(50),
      }),
    )
    .default([]),
  slots: defaultObject({
    total: z.number().int().min(0).default(6),
    startingUnlocked: z.number().int().min(0).default(2),
  }),
  prices: defaultObject({
    baseCost: z.number().min(0).default(50),
    costMultiplier: z.number().min(1).default(1.35),
    refundMultiplier: z.number().min(0).max(1).default(0.5),
  }),
});

const MapsSchema = defaultObject({
  town: defaultObject({
    districts: z.number().int().min(1).default(3),
    interiorsMin: z.number().int().min(0).default(6),
    interiorsMax: z.number().int().min(0).default(10),
    tileSize: z.number().int().min(1).default(16),
    tilemaps: z
      .array(
        defaultObject({
          id: z.string().min(1).default("town-district-1"),
          path: z.string().min(1).default("/assets/maps/town-district-1.json"),
        }),
      )
      .default([]),
  }),
  interior: defaultObject({
    minRooms: z.number().int().min(1).default(2),
    maxRooms: z.number().int().min(1).default(6),
    tilemaps: z
      .array(
        defaultObject({
          id: z.string().min(1).default("interior-1"),
          path: z.string().min(1).default("/assets/maps/interior-1.json"),
        }),
      )
      .default([]),
  }),
  castle: defaultObject({
    respawnRoom: z.string().default("coffin"),
    tilemap: defaultObject({
      id: z.string().min(1).default("castle"),
      path: z.string().min(1).default("/assets/maps/castle.json"),
    }),
  }),
  assets: defaultObject({
    tileset: defaultObject({
      key: z.string().min(1).default("placeholder-tiles"),
      imagePath: z.string().min(1).default("/assets/tilesets/placeholder.png"),
      tileWidth: z.number().int().min(1).default(16),
      tileHeight: z.number().int().min(1).default(16),
    }),
    playerSprite: defaultObject({
      key: z.string().min(1).default("player"),
      imagePath: z.string().min(1).default("/assets/sprites/player.png"),
      frameWidth: z.number().int().min(1).default(16),
      frameHeight: z.number().int().min(1).default(16),
    }),
    npcSprite: defaultObject({
      key: z.string().min(1).default("npc"),
      imagePath: z.string().min(1).default("/assets/sprites/npc.png"),
      frameWidth: z.number().int().min(1).default(16),
      frameHeight: z.number().int().min(1).default(16),
    }),
  }),
});

export const ConfigSchema = z
  .object({
    game: withEmptyDefault(
      z
        .object({
          version: z.string().default("0.1"),
          locale: z.string().default("en"),
        })
        .partial()
        .strict(),
    ),
    player: withEmptyDefault(
      z
        .object({
          name: PlayerNameSchema,
          stats: PlayerStatsSchema,
          blood: PlayerBloodSchema,
          actions: PlayerActionsSchema,
        })
        .partial()
        .strict(),
    ),
    controls: ControlsSchema,
    dayNight: DayNightSchema,
    sun: SunSchema,
    panic: PanicSchema,
    heat: HeatSchema,
    humans: HumansSchema,
    npc: NpcSchema,
    police: PoliceSchema,
    feeding: FeedingSchema,
    performance: PerformanceSchema,
    ui: UiSchema,
    upgrades: UpgradesSchema,
    maps: MapsSchema,
  })
  .strict();

export type GameConfig = z.infer<typeof ConfigSchema>;
