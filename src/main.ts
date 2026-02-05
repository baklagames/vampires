import Phaser from "phaser";

import { loadConfig } from "./config/loader";
import { NavigationController } from "./ui/navigation-controller";
import { applyTokensToCssVars } from "./ui/tokens-css";
import { TOKENS } from "./ui/tokens";

class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    const { width, height } = this.scale;
    const textStyle = {
      fontFamily: "sans-serif",
      fontSize: `${TOKENS.typography.lg}px`,
      color: TOKENS.colors.textPrimary,
    };
    this.add.text(width / 2, height / 2, "Vampires Prototype", textStyle).setOrigin(0.5);
  }
}

const startGame = async () => {
  applyTokensToCssVars();
  const config = await loadConfig("/assets/config/default.yaml");
  const navigation = new NavigationController({ initialScreen: "splash" });

  const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "app",
    backgroundColor: TOKENS.colors.background,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: TOKENS.spacing.lg * 22.5,
      height: TOKENS.spacing.lg * 40,
    },
    scene: [BootScene],
  };

  const game = new Phaser.Game(gameConfig);

  // Keep references to avoid tree-shaking and ensure bootstrapping work.
  void config;
  void navigation;
  void game;
};

startGame().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start game", error);
});
