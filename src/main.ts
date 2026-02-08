import Phaser from "phaser";

import { parseConfigYaml } from "./config/loader";
import defaultConfigYaml from "./config/default.yaml?raw";
import { PhaserCastleScene } from "./scenes/phaser-castle-scene";
import { PhaserInteriorScene } from "./scenes/phaser-interior-scene";
import { PhaserTownScene } from "./scenes/phaser-town-scene";
import { NavigationController } from "./ui/navigation-controller";
import { getSplashDelayMs } from "./ui/splash-timing";
import { applyTokensToCssVars } from "./ui/tokens-css";
import { TOKENS } from "./ui/tokens";

class BootScene extends Phaser.Scene {
  private readonly config: Readonly<import("./config/schema").GameConfig>;

  constructor(config: Readonly<import("./config/schema").GameConfig>) {
    super("boot");
    this.config = config;
  }

  preload() {
    this.load.image("splash-bg", "/assets/ui/splash-bg.png");
  }

  create() {
    const registryConfig = this.registry.get("config") as
      | Readonly<import("./config/schema").GameConfig>
      | undefined;
    const activeConfig = registryConfig ?? this.config;
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "splash-bg")
      .setDisplaySize(width, height)
      .setOrigin(0.5);
    const textStyle = {
      fontFamily: "sans-serif",
      fontSize: `${TOKENS.typography.lg}px`,
      color: TOKENS.colors.textPrimary,
    };
    this.add.text(width / 2, height / 2, "Vampires Prototype", textStyle).setOrigin(0.5);

    const splashMs = getSplashDelayMs(activeConfig);
    this.time.delayedCall(splashMs, () => {
      this.scene.start("town");
      this.scene.stop("boot");
    });
  }
}

const startGame = async () => {
  applyTokensToCssVars();
  const config = parseConfigYaml(defaultConfigYaml);
  const navigation = new NavigationController({ initialScreen: "splash" });
  const bootScene = new BootScene(config);
  const townScene = new PhaserTownScene(config, 0);
  const interiorScene = new PhaserInteriorScene(config, 0);
  const castleScene = new PhaserCastleScene(config);

  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "app",
    backgroundColor: TOKENS.colors.background,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: TOKENS.spacing.lg * 22.5,
      height: TOKENS.spacing.lg * 40,
    },
    scene: [bootScene, townScene, interiorScene, castleScene],
  };

  const game = new Phaser.Game(gameConfig);
  game.registry.set("config", config);

  // Keep references to avoid tree-shaking and ensure bootstrapping work.
  void config;
  void navigation;
  void game;
};

startGame().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start game", error);
});
