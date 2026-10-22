import {
  DEFAULT_FORMATION,
  DEFAULT_GK_JERSEY_COLOR,
  DEFAULT_JERSEY_COLOR,
  DEFAULT_PLAYER_NAME_PREFIX,
} from '../const/BoardCONST';
import { BoardStorage } from './BoardStorage';
import { formationPositions } from './formations';
import type { BoardState, ColorKey, FormationName, Position } from './types';

/** Holds the board state. Every change is saved immediately. */
export class BoardModel {
  private current: BoardState;

  constructor(private readonly storage = new BoardStorage()) {
    this.current = storage.load() ?? BoardModel.createDefault();
    this.save();
  }

  get state(): Readonly<BoardState> {
    return this.current;
  }

  /** Moves every player to the formation's positions; names are kept. */
  setFormation(name: FormationName) {
    this.current.formation = name;
    formationPositions(name).forEach((pos, i) => Object.assign(this.current.players[i], pos));
    this.save();
  }

  setColor(key: ColorKey, value: string) {
    this.current[key] = value;
    this.save();
  }

  setName(index: number, name: string) {
    this.current.players[index].name = name;
    this.save();
  }

  movePlayer(index: number, pos: Position) {
    Object.assign(this.current.players[index], pos);
    this.save();
  }

  reset() {
    this.current = BoardModel.createDefault();
    this.save();
  }

  shareHash(): string {
    return this.storage.encode(this.current);
  }

  private save() {
    this.storage.save(this.current);
  }

  private static createDefault(): BoardState {
    return {
      formation: DEFAULT_FORMATION,
      color: DEFAULT_JERSEY_COLOR,
      gkColor: DEFAULT_GK_JERSEY_COLOR,
      players: formationPositions(DEFAULT_FORMATION).map((pos, i) => ({
        name: `${DEFAULT_PLAYER_NAME_PREFIX}${i + 1}`,
        ...pos,
      })),
    };
  }
}
