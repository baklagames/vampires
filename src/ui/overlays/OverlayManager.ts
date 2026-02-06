import type { GameConfig } from "../../config/schema";
import { FlashOverlay } from "./FlashOverlay";
import { PanicAreaIndicator } from "./PanicAreaIndicator";
import { SunDangerOverlay } from "./SunDangerOverlay";
import { TapMarker } from "./TapMarker";
import { TargetRingOutline } from "./TargetRingOutline";
import { TargetRingFlash } from "../target-ring-flash";

export class OverlayManager {
  readonly flash: FlashOverlay;
  readonly targetRing: TargetRingFlash;
  readonly targetOutline: TargetRingOutline;
  readonly panicArea: PanicAreaIndicator;
  readonly sunDanger: SunDangerOverlay;
  readonly tapMarker: TapMarker;

  constructor(config: Readonly<GameConfig>) {
    this.flash = new FlashOverlay();
    this.targetRing = new TargetRingFlash(config);
    this.targetOutline = new TargetRingOutline();
    this.panicArea = new PanicAreaIndicator();
    this.sunDanger = new SunDangerOverlay();
    this.tapMarker = new TapMarker();
  }

  advance(deltaMs: number): void {
    this.flash.advance(deltaMs);
    this.targetRing.advance(deltaMs);
    this.tapMarker.advance(deltaMs);
  }
}
