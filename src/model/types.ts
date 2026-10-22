import type { FORMATIONS, FORMATIONS_BY_TEAM_SIZE } from '../const/FormationCONST';

export type TeamSize = keyof typeof FORMATIONS_BY_TEAM_SIZE;

export type FormationName = keyof typeof FORMATIONS;

export type PitchType = 'soccer' | 'futsal';

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
