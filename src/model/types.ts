import type { FORMATIONS } from '../const/FormationCONST';

export type FormationName = keyof typeof FORMATIONS;

/** Normalized to the field: (0, 0) is the top-left corner, (1, 1) the bottom-right. */
export type Position = { x: number; y: number };

export type Player = Position & { name: string };

export type ColorKey = 'color' | 'gkColor';

export type BoardState = {
  name: string; // preset name, also carried in share links
  formation: FormationName;
  color: string; // outfield jersey
  gkColor: string; // goalkeeper jersey
  players: Player[]; // GOALKEEPER_INDEX is the goalkeeper
};

export type PresetSummary = { slot: number; name: string };
