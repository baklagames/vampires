import type { GameConfig } from "../config/schema";

export type DayPhase = "day" | "dusk" | "night" | "dawn";

export type DayNightCycleConfig = {
  totalSeconds: number;
  daySeconds: number;
  duskSeconds: number;
  nightSeconds: number;
  dawnSeconds: number;
};

export type PhaseChangeEvent = {
  from: DayPhase;
  to: DayPhase;
  elapsedSeconds: number;
  isWarning: boolean;
};

export type PhaseChangeListener = (event: PhaseChangeEvent) => void;
export type PhaseWarningListener = (event: PhaseChangeEvent) => void;

export class DayNightController {
  private readonly cycle: DayNightCycleConfig;
  private readonly npcDensity: Readonly<GameConfig["dayNight"]["npcDensity"]>;
  private readonly police: Readonly<GameConfig["police"]>;
  private elapsedSeconds: number;
  private phase: DayPhase;
  private readonly phaseListeners = new Set<PhaseChangeListener>();
  private readonly warningListeners = new Set<PhaseWarningListener>();

  constructor(config: Readonly<GameConfig>, startAtSeconds = 0) {
    this.cycle = config.dayNight.cycle;
    this.npcDensity = config.dayNight.npcDensity;
    this.police = config.police;
    this.elapsedSeconds = normalizeTime(startAtSeconds, this.cycle.totalSeconds);
    this.phase = phaseFromElapsed(this.elapsedSeconds, this.cycle);
  }

  advance(deltaSeconds: number): DayPhase {
    if (deltaSeconds <= 0) {
      return this.phase;
    }

    this.elapsedSeconds = normalizeTime(
      this.elapsedSeconds + deltaSeconds,
      this.cycle.totalSeconds,
    );
    const nextPhase = phaseFromElapsed(this.elapsedSeconds, this.cycle);
    if (nextPhase !== this.phase) {
      const previous = this.phase;
      this.phase = nextPhase;
      this.emitPhaseChange({ from: previous, to: nextPhase });
    } else {
      this.phase = nextPhase;
    }

    return this.phase;
  }

  getPhase(): DayPhase {
    return this.phase;
  }

  getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  getPhaseElapsedSeconds(): number {
    const { phaseStart } = getPhaseWindow(this.phase, this.cycle);
    return Math.max(0, this.elapsedSeconds - phaseStart);
  }

  getPhaseDurationSeconds(): number {
    const { duration } = getPhaseWindow(this.phase, this.cycle);
    return duration;
  }

  getPhaseProgress(): number {
    const duration = this.getPhaseDurationSeconds();
    if (duration <= 0) {
      return 1;
    }

    return this.getPhaseElapsedSeconds() / duration;
  }

  getNpcDensityMultiplier(): number {
    return this.phase === "night"
      ? this.npcDensity.nightMultiplier
      : this.npcDensity.dayMultiplier;
  }

  getPolicePresenceMultiplier(): number {
    return this.phase === "night" ? this.police.spawn.nightMultiplier : 1;
  }

  onPhaseChange(listener: PhaseChangeListener): () => void {
    this.phaseListeners.add(listener);
    return () => {
      this.phaseListeners.delete(listener);
    };
  }

  onPhaseWarning(listener: PhaseWarningListener): () => void {
    this.warningListeners.add(listener);
    return () => {
      this.warningListeners.delete(listener);
    };
  }

  private emitPhaseChange(event: Omit<PhaseChangeEvent, "elapsedSeconds">): void {
    const isWarning = event.to === "dusk" || event.to === "dawn";
    const payload: PhaseChangeEvent = {
      ...event,
      isWarning,
      elapsedSeconds: this.elapsedSeconds,
    };
    for (const listener of this.phaseListeners) {
      listener(payload);
    }
    if (isWarning) {
      for (const listener of this.warningListeners) {
        listener(payload);
      }
    }
  }
}

const normalizeTime = (value: number, totalSeconds: number): number => {
  if (totalSeconds <= 0) {
    return 0;
  }

  const normalized = value % totalSeconds;
  return normalized < 0 ? normalized + totalSeconds : normalized;
};

const phaseFromElapsed = (
  elapsedSeconds: number,
  cycle: DayNightCycleConfig,
): DayPhase => {
  const { dayEnd, duskEnd, nightEnd } = getPhaseBoundaries(cycle);

  if (elapsedSeconds < dayEnd) {
    return "day";
  }
  if (elapsedSeconds < duskEnd) {
    return "dusk";
  }
  if (elapsedSeconds < nightEnd) {
    return "night";
  }

  return "dawn";
};

const getPhaseBoundaries = (cycle: DayNightCycleConfig) => {
  const dayEnd = cycle.daySeconds;
  const duskEnd = dayEnd + cycle.duskSeconds;
  const nightEnd = duskEnd + cycle.nightSeconds;
  const dawnEnd = nightEnd + cycle.dawnSeconds;

  return { dayEnd, duskEnd, nightEnd, dawnEnd };
};

const getPhaseWindow = (phase: DayPhase, cycle: DayNightCycleConfig) => {
  const { dayEnd, duskEnd, nightEnd } = getPhaseBoundaries(cycle);

  switch (phase) {
    case "day":
      return { phaseStart: 0, duration: cycle.daySeconds };
    case "dusk":
      return { phaseStart: dayEnd, duration: cycle.duskSeconds };
    case "night":
      return { phaseStart: duskEnd, duration: cycle.nightSeconds };
    case "dawn":
      return { phaseStart: nightEnd, duration: cycle.dawnSeconds };
  }
};
