export const FORMATIONS_BY_TEAM_SIZE = {
  5: {
    '1-2-1': [1, 2, 1],
    '2-2': [2, 2],
    '2-1-1': [2, 1, 1],
    '3-1': [3, 1],
    '1-1-2': [1, 1, 2],
  },
  6: {
    '2-1-2': [2, 1, 2],
    '2-2-1': [2, 2, 1],
    '1-2-2': [1, 2, 2],
    '3-1-1': [3, 1, 1],
    '1-3-1': [1, 3, 1],
  },
  7: {
    '2-3-1': [2, 3, 1],
    '3-2-1': [3, 2, 1],
    '3-1-2': [3, 1, 2],
    '2-2-2': [2, 2, 2],
    '3-3': [3, 3],
  },
  11: {
    '4-3-3': [4, 3, 3],
    '4-4-2': [4, 4, 2],
    '4-2-3-1': [4, 2, 3, 1],
    '4-1-4-1': [4, 1, 4, 1],
    '3-5-2': [3, 5, 2],
    '3-4-3': [3, 4, 3],
    '5-3-2': [5, 3, 2],
    '5-4-1': [5, 4, 1],
  },
} as const satisfies Record<number, Record<string, readonly number[]>>;

export const FORMATIONS = {
  ...FORMATIONS_BY_TEAM_SIZE[5],
  ...FORMATIONS_BY_TEAM_SIZE[6],
  ...FORMATIONS_BY_TEAM_SIZE[7],
  ...FORMATIONS_BY_TEAM_SIZE[11],
};

export const TEAM_SIZES = Object.keys(FORMATIONS_BY_TEAM_SIZE).map(Number) as (keyof typeof FORMATIONS_BY_TEAM_SIZE)[];

export const GOALKEEPER_X = 0.5;
export const GOALKEEPER_Y = 0.92;
export const BACK_LINE_Y = 0.76;
export const FRONT_LINE_Y = 0.2;
export const SIDE_PADDING_X = 0.03;
