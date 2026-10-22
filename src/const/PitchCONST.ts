import type { PitchType, TeamSize } from '../model/types';

export const PITCH_TYPE_BY_TEAM_SIZE: Record<TeamSize, PitchType> = {
  5: 'futsal',
  6: 'futsal',
  7: 'futsal',
  11: 'soccer',
};

export const SOCCER_FIELD_WIDTH_M = 68;
export const SOCCER_FIELD_LENGTH_M = 105;
export const SOCCER_CENTER_CIRCLE_RADIUS_M = 9.15;
export const SOCCER_PENALTY_AREA_WIDTH_M = 40.32;
export const SOCCER_PENALTY_AREA_DEPTH_M = 16.5;
export const SOCCER_GOAL_AREA_WIDTH_M = 18.32;
export const SOCCER_GOAL_AREA_DEPTH_M = 5.5;
export const SOCCER_GOAL_WIDTH_M = 7.32;
export const SOCCER_GOAL_DEPTH_M = 2;
export const SOCCER_PENALTY_SPOT_DISTANCE_M = 11;
export const SOCCER_PENALTY_ARC_RADIUS_M = 9.15;
export const SOCCER_CORNER_ARC_RADIUS_M = 1;

export const FUTSAL_FIELD_WIDTH_M = 20;
export const FUTSAL_FIELD_LENGTH_M = 40;
export const FUTSAL_CENTER_CIRCLE_RADIUS_M = 3;
export const FUTSAL_PENALTY_AREA_RADIUS_M = 6;
export const FUTSAL_PENALTY_AREA_LINE_LENGTH_M = 3.16;
export const FUTSAL_GOAL_WIDTH_M = 3;
export const FUTSAL_GOAL_DEPTH_M = 1;
export const FUTSAL_PENALTY_SPOT_DISTANCE_M = 6;
export const FUTSAL_SECOND_PENALTY_SPOT_DISTANCE_M = 10;
export const FUTSAL_CORNER_ARC_RADIUS_M = 0.25;

export const GRASS_COLOR = 0x2e7d32;
export const GRASS_STRIPE_COLOR = 0x388e3c;
export const GRASS_STRIPE_COUNT = 14;
export const LINE_WIDTH = 2;
export const LINE_COLOR = 0xffffff;
export const LINE_ALPHA = 0.9;
export const SPOT_RADIUS_PX = 3;
