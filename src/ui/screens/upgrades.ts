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

export const buildUpgradesState = (): UpgradesState => {
  const items: UpgradeItem[] = [
    {
      id: "upgrade-1",
      name: "Shadow Step",
      description: "Short dash to evade",
      cost: 50,
      card: buildPixelCardState({ title: "Shadow Step", subtitle: "Dash to evade" }),
      action: buildButtonPrimaryState("Buy 50"),
    },
    {
      id: "upgrade-2",
      name: "Blood Pact",
      description: "Increase max blood",
      cost: 75,
      card: buildPixelCardState({ title: "Blood Pact", subtitle: "+10 Max Blood" }),
      action: buildButtonPrimaryState("Buy 75"),
    },
  ];

  return {
    title: "Upgrades",
    items,
    backButton: buildButtonSecondaryState("Back"),
    listItems: items.map((item) =>
      buildListItemState(item.name, { description: item.description, accessory: `${item.cost}` }),
    ),
    accent: TOKENS.colors.accent,
  };
};
