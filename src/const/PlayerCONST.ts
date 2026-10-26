export const PLAYER_HALF_WIDTH = 38;
export const PLAYER_TOP = 50;
export const PLAYER_BOTTOM = 38;

const PLAYER_MAX_DIAMETER = Math.max(PLAYER_HALF_WIDTH * 2, PLAYER_TOP + PLAYER_BOTTOM);
// Dropping a player whose center lands within this circle around another player swaps their positions.
export const PLAYER_SWAP_RADIUS = (PLAYER_MAX_DIAMETER * 0.5) / 2;
