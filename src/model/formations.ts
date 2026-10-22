import { BACK_LINE_Y, FORMATIONS, FRONT_LINE_Y, GOALKEEPER_X, GOALKEEPER_Y, SIDE_PADDING_X } from '../const/FormationCONST';
import type { FormationName, Position } from './types';

export function formationPositions(name: FormationName): Position[] {
  const rows: readonly number[] = FORMATIONS[name];
  const positions = [{ x: GOALKEEPER_X, y: GOALKEEPER_Y }];
  rows.forEach((count, r) => {
    const y = BACK_LINE_Y - ((BACK_LINE_Y - FRONT_LINE_Y) * r) / (rows.length - 1);
    for (let i = 0; i < count; i++) {
      positions.push({ x: SIDE_PADDING_X + ((1 - SIDE_PADDING_X * 2) * (i + 0.5)) / count, y });
    }
  });
  return positions;
}
