export const FORMATIONS = {
  '4-4-2': [4, 4, 2],
  '4-3-3': [4, 3, 3],
  '4-2-3-1': [4, 2, 3, 1],
  '4-1-4-1': [4, 1, 4, 1],
  '3-5-2': [3, 5, 2],
  '3-4-3': [3, 4, 3],
  '5-3-2': [5, 3, 2],
  '5-4-1': [5, 4, 1],
} as const satisfies Record<string, readonly number[]>;

export const FORMATION_NAMES = Object.keys(FORMATIONS) as (keyof typeof FORMATIONS)[];

export const GOALKEEPER_X = 0.5;
export const GOALKEEPER_Y = 0.92;
export const BACK_LINE_Y = 0.76;
export const FRONT_LINE_Y = 0.2;
export const SIDE_PADDING_X = 0.03;
