import type { GameConfig } from "../../config/schema";
import type { SaveState } from "../save-storage";
import { buildButtonPrimaryState, buildButtonSecondaryState } from "../components/Buttons";
import { buildListItemState } from "../components/ListItem";
import { buildPixelCardState } from "../components/PixelCard";
import { TOKENS } from "../tokens";

export type UpgradeItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  card: ReturnType<typeof buildPixelCardState>;
  action: ReturnType<typeof buildButtonPrimaryState>;
};

export type UpgradesState = {
  title: string;
  items: UpgradeItem[];
  backButton: ReturnType<typeof buildButtonSecondaryState>;
  listItems: Array<ReturnType<typeof buildListItemState>>;
  accent: string;
};

export const buildUpgradesState = (
  config: Readonly<GameConfig>,
  save: SaveState,
): UpgradesState => {
  const owned = new Set(save.upgrades.owned);
  const items: UpgradeItem[] = config.upgrades.items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    cost: item.cost,
    card: buildPixelCardState({ title: item.name, subtitle: item.description }),
    action: buildButtonPrimaryState(owned.has(item.id) ? "Owned" : `Buy ${item.cost}`),
  }));

  return {
    title: "Upgrades",
    items,
    backButton: buildButtonSecondaryState("Back"),
    listItems: items.map((item) =>
      buildListItemState(item.name, {
        description: item.description,
        accessory: owned.has(item.id) ? "Owned" : `${item.cost}`,
      }),
    ),
    accent: TOKENS.colors.accent,
  };
};
