import { z } from "zod";

const OnInvalidSchema = z.enum(["reject", "strip", "replace"]);

const PlayerNameSchema = z
  .object({
    random: z
      .object({
        enabled: z.boolean().default(true),
        length: z.number().int().min(1).default(8),
        charset: z.string().default("A-Za-z0-9"),
      })
      .strict()
      .default({}),
    manualInput: z
      .object({
        enabled: z.boolean().default(true),
        regex: z.string().default("^[A-Za-z0-9]{3,12}$"),
        onInvalid: OnInvalidSchema.default("reject"),
        replaceChar: z.string().min(1).max(1).default("_"),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const ControlsSchema = z
  .object({
    tapToMove: z
      .object({
        enabled: z.boolean().default(true),
      })
      .strict()
      .default({}),
    tapToTarget: z
      .object({
        enabled: z.boolean().default(true),
      })
      .strict()
      .default({}),
    targetRing: z
      .object({
        flashMs: z.number().int().min(0).default(200),
      })
      .strict()
      .default({}),
    tapMarker: z
      .object({
        enabled: z.boolean().default(false),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const DayNightSchema = z
  .object({
    cycle: z
      .object({
        totalSeconds: z.number().min(1).default(420),
        daySeconds: z.number().min(0).default(160),
        duskSeconds: z.number().min(0).default(40),
        nightSeconds: z.number().min(0).default(160),
        dawnSeconds: z.number().min(0).default(60),
      })
      .strict()
      .default({}),
    npcDensity: z
      .object({
        dayMultiplier: z.number().min(0).default(1.0),
        nightMultiplier: z.number().min(0).default(0.45),
      })
      .strict()
      .default({}),
  })
  .strict()
  .superRefine((value, ctx) => {
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
  })
  .default({});

const SunSchema = z
  .object({
    enabled: z.boolean().default(true),
    damagePerSecond: z.number().min(0).default(12),
    graceMs: z.number().int().min(0).default(150),
    safeZones: z
      .object({
        indoors: z.boolean().default(true),
        castle: z.boolean().default(true),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const PanicSchema = z
  .object({
    bubble: z
      .object({
        radiusTiles: z.number().min(0).default(10),
        durationSeconds: z.number().min(0).default(25),
      })
      .strict()
      .default({}),
    witness: z
      .object({
        callPoliceDelaySeconds: z.number().min(0).default(2.0),
        panicSpreadWithinBubble: z.boolean().default(true),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const HeatSchema = z
  .object({
    levels: z.number().int().min(1).default(6),
    decay: z
      .object({
        enabled: z.boolean().default(true),
        secondsToStartDecay: z.number().min(0).default(6),
        decayPerSecond: z.number().min(0).default(0.6),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const HumansSchema = z
  .object({
    base: z
      .object({
        walkSpeed: z.number().min(0).default(1.0),
        bloodQuality: z.number().min(0).default(1.0),
      })
      .strict()
      .default({}),
    variants: z
      .object({
        adultMale: z
          .object({
            speedMultiplier: z.number().min(0).default(1.0),
            bloodQualityMultiplier: z.number().min(0).default(1.0),
          })
          .strict()
          .default({}),
        adultFemale: z
          .object({
            speedMultiplier: z.number().min(0).default(1.0),
            bloodQualityMultiplier: z.number().min(0).default(1.0),
          })
          .strict()
          .default({}),
        kid: z
          .object({
            speedMultiplier: z.number().min(0).default(1.35),
            bloodQualityMultiplier: z.number().min(0).default(1.25),
          })
          .strict()
          .default({}),
        grandma: z
          .object({
            speedMultiplier: z.number().min(0).default(0.75),
            bloodQualityMultiplier: z.number().min(0).default(0.8),
          })
          .strict()
          .default({}),
        grandpa: z
          .object({
            speedMultiplier: z.number().min(0).default(0.75),
            bloodQualityMultiplier: z.number().min(0).default(0.8),
          })
          .strict()
          .default({}),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const PoliceSchema = z
  .object({
    enabled: z.boolean().default(true),
    spawn: z
      .object({
        baseCount: z.number().int().min(0).default(2),
        responseCountPerHeat: z.number().int().min(0).default(1),
        nightMultiplier: z.number().min(0).default(2.0),
      })
      .strict()
      .default({}),
    vision: z
      .object({
        dayRangeTiles: z.number().min(0).default(9),
        nightRangeTiles: z.number().min(0).default(6),
      })
      .strict()
      .default({}),
    damage: z
      .object({
        bulletDamage: z.number().min(0).default(10),
        fireRatePerSecond: z.number().min(0).default(0.8),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const FeedingSchema = z
  .object({
    bite: z
      .object({
        rangeTiles: z.number().min(0).default(1.0),
        baseDurationSeconds: z.number().min(0).default(2.4),
        interruptible: z.boolean().default(true),
      })
      .strict()
      .default({}),
    reward: z
      .object({
        baseBloodGain: z.number().min(0).default(20),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

const PerformanceSchema = z
  .object({
    maxActiveNpcs: z
      .object({
        town: z.number().int().min(0).default(40),
        interior: z.number().int().min(0).default(12),
      })
      .strict()
      .default({}),
  })
  .strict()
  .default({});

export const ConfigSchema = z
  .object({
    game: z
      .object({
        version: z.string().default("0.1"),
        locale: z.string().default("en"),
      })
      .partial()
      .strict()
      .default({}),
    player: z
      .object({
        name: PlayerNameSchema,
      })
      .partial()
      .strict()
      .default({}),
    controls: ControlsSchema,
    dayNight: DayNightSchema,
    sun: SunSchema,
    panic: PanicSchema,
    heat: HeatSchema,
    humans: HumansSchema,
    police: PoliceSchema,
    feeding: FeedingSchema,
    performance: PerformanceSchema,
  })
  .strict();

export type GameConfig = z.infer<typeof ConfigSchema>;
