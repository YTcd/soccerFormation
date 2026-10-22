import {
  DEFAULT_FORMATION,
  DEFAULT_GK_JERSEY_COLOR,
  DEFAULT_JERSEY_COLOR,
  DEFAULT_PLAYER_NAME_PREFIX,
} from '../const/BoardCONST';
import { BASE_PRESET_SLOT, DEFAULT_PRESET_NAME_PREFIX, MAX_PRESET_COUNT } from '../const/PresetCONST';
import { BoardStorage } from './BoardStorage';
import { formationPositions } from './formations';
import type { BoardState, ColorKey, FormationName, Position, PresetSummary } from './types';

export class BoardModel {
  private readonly presets: Map<number, BoardState>;
  private active: number;
  private shared: BoardState | null;

  constructor(private readonly storage = new BoardStorage()) {
    this.presets = storage.loadPresets();
    if (!this.presets.has(BASE_PRESET_SLOT)) this.store(BASE_PRESET_SLOT, BoardModel.createDefault(BASE_PRESET_SLOT));
    const saved = storage.loadActiveSlot();
    this.active = this.presets.has(saved) ? saved : BASE_PRESET_SLOT;
    this.shared = null;
    this.openSharedLink();
  }

  get state(): Readonly<BoardState> {
    return this.shared ?? this.activePreset;
  }

  get isSharedView(): boolean {
    return this.shared !== null;
  }

  get activeSlot(): number {
    return this.active;
  }

  get presetList(): PresetSummary[] {
    return [...this.presets]
      .sort(([a], [b]) => a - b)
      .map(([slot, state]) => ({ slot, name: state.name }));
  }

  get canAddPreset(): boolean {
    return this.presets.size < MAX_PRESET_COUNT;
  }

  selectPreset(slot: number) {
    if (!this.presets.has(slot)) return;
    this.active = slot;
    this.storage.saveActiveSlot(slot);
    this.leaveSharedView();
  }

  addPreset() {
    const slot = this.freeSlot();
    if (slot === null) return;
    this.store(slot, BoardModel.createDefault(slot));
    this.selectPreset(slot);
  }

  deletePreset() {
    if (this.active === BASE_PRESET_SLOT) return;
    this.presets.delete(this.active);
    this.storage.removePreset(this.active);
    this.selectPreset(BASE_PRESET_SLOT);
  }

  renamePreset(name: string) {
    this.edit((s) => (s.name = name));
  }

  saveSharedAsPreset() {
    const slot = this.freeSlot();
    if (!this.shared || slot === null) return;
    this.store(slot, this.shared);
    this.selectPreset(slot);
  }

  openSharedLink() {
    this.shared = this.storage.readSharedLink() ?? this.shared;
  }

  leaveSharedView() {
    this.shared = null;
    this.storage.clearSharedLink();
  }

  setFormation(name: FormationName) {
    this.edit((s) => {
      s.formation = name;
      formationPositions(name).forEach((pos, i) => Object.assign(s.players[i], pos));
    });
  }

  setColor(key: ColorKey, value: string) {
    this.edit((s) => (s[key] = value));
  }

  setName(index: number, name: string) {
    this.edit((s) => (s.players[index].name = name));
  }

  movePlayer(index: number, pos: Position) {
    this.edit((s) => Object.assign(s.players[index], pos));
  }

  reset() {
    if (this.shared) return;
    this.store(this.active, { ...BoardModel.createDefault(this.active), name: this.activePreset.name });
  }

  shareHash(): string {
    return this.storage.encode(this.state);
  }

  private get activePreset(): BoardState {
    return this.presets.get(this.active)!;
  }

  private edit(change: (state: BoardState) => void) {
    if (this.shared) return;
    change(this.activePreset);
    this.storage.savePreset(this.active, this.activePreset);
  }

  private store(slot: number, state: BoardState) {
    this.presets.set(slot, state);
    this.storage.savePreset(slot, state);
  }

  private freeSlot(): number | null {
    for (let slot = 1; slot <= MAX_PRESET_COUNT; slot++) {
      if (!this.presets.has(slot)) return slot;
    }
    return null;
  }

  private static createDefault(slot: number): BoardState {
    return {
      name: `${DEFAULT_PRESET_NAME_PREFIX}${slot}`,
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
