/** Players per row from defense to attack (goalkeeper excluded). */
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

// Where formation rows are placed, normalized to the field (0 = top goal line, 1 = bottom goal line).
export const GOALKEEPER_X = 0.5;
export const GOALKEEPER_Y = 0.93;
export const BACK_LINE_Y = 0.78;
export const FRONT_LINE_Y = 0.4;
export const SIDE_PADDING_X = 0.08;
