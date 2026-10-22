import type { FORMATIONS } from '../const/FormationCONST';

export type FormationName = keyof typeof FORMATIONS;

export type Position = { x: number; y: number };

export type Player = Position & { name: string };

export type ColorKey = 'color' | 'gkColor';

export type BoardState = {
  name: string;
  formation: FormationName;
  color: string;
  gkColor: string;
  players: Player[];
};

export type PresetSummary = { slot: number; name: string };
