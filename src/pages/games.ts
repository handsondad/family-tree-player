import type { Settings } from "../components/Shared";

export type GameProps = {
  settings: Settings;
  onBack: () => void;
  onTree: (id: string) => void;
  onFinish: (stars: number) => void;
};
