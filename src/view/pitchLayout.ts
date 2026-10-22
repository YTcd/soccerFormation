import { CANVAS_MARGIN, FUTSAL_PX_PER_METER, SOCCER_PX_PER_METER } from '../const/LayoutCONST';
import {
  FUTSAL_FIELD_LENGTH_M,
  FUTSAL_FIELD_WIDTH_M,
  PITCH_TYPE_BY_TEAM_SIZE,
  SOCCER_FIELD_LENGTH_M,
  SOCCER_FIELD_WIDTH_M,
} from '../const/PitchCONST';
import { getTeamSize } from '../model/formations';
import type { FormationName, PitchType } from '../model/types';

export type PitchLayout = {
  fieldWidthM: number;
  fieldLengthM: number;
  pxPerMeter: number;
  fieldWidthPx: number;
  fieldHeightPx: number;
  canvasWidth: number;
  canvasHeight: number;
};

export const PITCH_LAYOUTS: Record<PitchType, PitchLayout> = {
  soccer: createPitchLayout(SOCCER_FIELD_WIDTH_M, SOCCER_FIELD_LENGTH_M, SOCCER_PX_PER_METER),
  futsal: createPitchLayout(FUTSAL_FIELD_WIDTH_M, FUTSAL_FIELD_LENGTH_M, FUTSAL_PX_PER_METER),
};

export function getPitchType(formation: FormationName): PitchType {
  return PITCH_TYPE_BY_TEAM_SIZE[getTeamSize(formation)];
}

function createPitchLayout(fieldWidthM: number, fieldLengthM: number, pxPerMeter: number): PitchLayout {
  const fieldWidthPx = fieldWidthM * pxPerMeter;
  const fieldHeightPx = fieldLengthM * pxPerMeter;

  return {
    fieldWidthM,
    fieldLengthM,
    pxPerMeter,
    fieldWidthPx,
    fieldHeightPx,
    canvasWidth: fieldWidthPx + CANVAS_MARGIN * 2,
    canvasHeight: fieldHeightPx + CANVAS_MARGIN * 2,
  };
}
