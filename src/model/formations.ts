import {
  BACK_LINE_Y,
  FORMATIONS,
  FORMATIONS_BY_TEAM_SIZE,
  FRONT_LINE_Y,
  GOALKEEPER_X,
  GOALKEEPER_Y,
  SIDE_PADDING_X,
  TEAM_SIZES,
} from '../const/FormationCONST';
import type { FormationName, Position, TeamSize } from './types';

export function getFormationNames(teamSize: TeamSize): FormationName[] {
  return Object.keys(FORMATIONS_BY_TEAM_SIZE[teamSize]) as FormationName[];
}

export function getDefaultFormation(teamSize: TeamSize): FormationName {
  return getFormationNames(teamSize)[0];
}

export function getTeamSize(formation: FormationName): TeamSize {
  return TEAM_SIZES.find((teamSize) => Object.hasOwn(FORMATIONS_BY_TEAM_SIZE[teamSize], formation))!;
}

export function isFormationName(value: unknown): value is FormationName {
  return typeof value === 'string' && Object.hasOwn(FORMATIONS, value);
}

export function getFormationPositions(name: FormationName): Position[] {
  const playerCountsByRow: readonly number[] = FORMATIONS[name];
  const lastRowIndex = playerCountsByRow.length - 1;
  const lineDistance = BACK_LINE_Y - FRONT_LINE_Y;
  const usableWidth = 1 - SIDE_PADDING_X * 2;

  const positions: Position[] = [{ x: GOALKEEPER_X, y: GOALKEEPER_Y }];

  for (let rowIndex = 0; rowIndex < playerCountsByRow.length; rowIndex++) {
    const playerCount = playerCountsByRow[rowIndex];
    const y = BACK_LINE_Y - (lineDistance * rowIndex) / lastRowIndex;

    for (let i = 0; i < playerCount; i++) {
      const x = SIDE_PADDING_X + (usableWidth * (i + 0.5)) / playerCount;
      positions.push({ x, y });
    }
  }

  return positions;
}
