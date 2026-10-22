// Jersey shape in px, centered at (0, 0). The collar is a curve from -X to +X.
export const JERSEY_COLLAR_X = 10;
export const JERSEY_COLLAR_Y = -30;
export const JERSEY_COLLAR_DIP_Y = -20;
export const JERSEY_TRIM_DIP_Y = -18;
/** Outline points after the collar, clockwise: right sleeve, body, left sleeve. */
export const JERSEY_OUTLINE = [
  [24, -27], [38, -12], [29, -3], [22, -10], // right shoulder and sleeve
  [22, 30], [-22, 30], // body
  [-22, -10], [-29, -3], [-38, -12], [-24, -27], // left sleeve and shoulder
] as const;

export const JERSEY_BORDER_COLOR = 0x000000;
export const JERSEY_BORDER_WIDTH = 2;
export const JERSEY_BORDER_ALPHA = 0.35;
export const JERSEY_TRIM_WIDTH = 3;
export const JERSEY_TRIM_ALPHA = 0.5;

export const SHADOW_COLOR = 0x000000;
export const SHADOW_Y = 33;
export const SHADOW_RADIUS_X = 26;
export const SHADOW_RADIUS_Y = 5;
export const SHADOW_ALPHA = 0.25;

// Area covered by the jersey and its shadow; used for hit testing and keeping it on the canvas.
export const PLAYER_HALF_WIDTH = 38;
export const PLAYER_TOP = 32;
export const PLAYER_BOTTOM = 38;

// Name on the chest. Longer names shrink to NAME_MAX_WIDTH.
export const NAME_FONT_FAMILY = ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'sans-serif'];
export const NAME_FONT_SIZE = 14;
export const NAME_FONT_WEIGHT = '700';
export const NAME_OFFSET_Y = 6;
export const NAME_MAX_WIDTH = 40;

// Name color: dark text on jerseys brighter than LIGHT_JERSEY_BRIGHTNESS (0-255), light text otherwise.
export const LIGHT_JERSEY_BRIGHTNESS = 160;
export const DARK_TEXT_COLOR = '#111111';
export const LIGHT_TEXT_COLOR = '#ffffff';
