import { FIELD_LENGTH_M, FIELD_WIDTH_M } from './PitchCONST';

// Canvas geometry: the field is drawn vertically with a grass margin around it.
export const PX_PER_METER = 9;
export const CANVAS_MARGIN = 30;
export const FIELD_WIDTH_PX = FIELD_WIDTH_M * PX_PER_METER;
export const FIELD_HEIGHT_PX = FIELD_LENGTH_M * PX_PER_METER;
export const CANVAS_WIDTH = FIELD_WIDTH_PX + CANVAS_MARGIN * 2;
export const CANVAS_HEIGHT = FIELD_HEIGHT_PX + CANVAS_MARGIN * 2;

export const MIN_RENDER_RESOLUTION = 2;
export const EXPORT_RESOLUTION = 2;
