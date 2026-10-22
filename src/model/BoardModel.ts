import {
  DEFAULT_GK_JERSEY_COLOR,
  DEFAULT_JERSEY_COLOR,
  DEFAULT_PLAYER_NAME_PREFIX,
  DEFAULT_TEAM_SIZE,
} from '../const/BoardCONST';
import { BASE_PRESET_SLOT, DEFAULT_PRESET_NAME_PREFIX, MAX_PRESET_COUNT } from '../const/PresetCONST';
import { BoardStorage } from './BoardStorage';
import { getDefaultFormation, getFormationPositions, getTeamSize } from './formations';
import type { BoardState, ColorKey, FormationName, Position, PresetSummary, TeamSize } from './types';

export class BoardModel {
  private readonly presets: Map<number, BoardState>;
  private currentSlot: number;
  private sharedState: BoardState | null = null;

  constructor(private readonly storage = new BoardStorage()) {
    this.presets = storage.loadPresets();

    if (!this.presets.has(BASE_PRESET_SLOT)) {
      this.savePreset(BASE_PRESET_SLOT, createDefaultPreset(BASE_PRESET_SLOT));
    }

    const savedSlot = storage.loadActiveSlot();
    this.currentSlot = this.presets.has(savedSlot) ? savedSlot : BASE_PRESET_SLOT;

    this.openSharedLink();
  }

  get state(): Readonly<BoardState> {
    return this.sharedState ?? this.activePreset;
  }

  get isSharedView(): boolean {
    return this.sharedState !== null;
  }

  get activeSlot(): number {
    return this.currentSlot;
  }

  get presetList(): PresetSummary[] {
    const sortedPresets = [...this.presets].sort(([slotA], [slotB]) => slotA - slotB);
    return sortedPresets.map(([slot, state]) => ({ slot, name: state.name }));
  }

  get canAddPreset(): boolean {
    return this.presets.size < MAX_PRESET_COUNT;
  }

  selectPreset(slot: number) {
    if (!this.presets.has(slot)) {
      return;
    }

    this.currentSlot = slot;
    this.storage.saveActiveSlot(slot);
    this.leaveSharedView();
  }

  addPreset() {
    const slot = this.findEmptySlot();
    if (slot === null) {
      return;
    }

    this.savePreset(slot, createDefaultPreset(slot));
    this.selectPreset(slot);
  }

  deletePreset() {
    if (this.currentSlot === BASE_PRESET_SLOT) {
      return;
    }

    this.presets.delete(this.currentSlot);
    this.storage.removePreset(this.currentSlot);
    this.selectPreset(BASE_PRESET_SLOT);
  }

  renamePreset(name: string) {
    this.editActivePreset((preset) => {
      preset.name = name;
    });
  }

  saveSharedAsPreset() {
    const slot = this.findEmptySlot();
    if (!this.sharedState || slot === null) {
      return;
    }

    this.savePreset(slot, this.sharedState);
    this.selectPreset(slot);
  }

  openSharedLink() {
    this.sharedState = this.storage.readSharedStateFromUrl() ?? this.sharedState;
  }

  leaveSharedView() {
    this.sharedState = null;
    this.storage.clearSharedStateFromUrl();
  }

  setTeamSize(teamSize: TeamSize) {
    this.setFormation(getDefaultFormation(teamSize));
  }

  setFormation(name: FormationName) {
    this.editActivePreset((preset) => {
      const positions = getFormationPositions(name);

      preset.formation = name;
      preset.players = positions.map((position, i) => ({
        name: preset.players[i]?.name ?? getDefaultPlayerName(i),
        ...position,
      }));
    });
  }

  setColor(key: ColorKey, value: string) {
    this.editActivePreset((preset) => {
      preset[key] = value;
    });
  }

  setPlayerName(index: number, name: string) {
    this.editActivePreset((preset) => {
      preset.players[index].name = name;
    });
  }

  movePlayer(index: number, position: Position) {
    this.editActivePreset((preset) => {
      preset.players[index].x = position.x;
      preset.players[index].y = position.y;
    });
  }

  resetActivePreset() {
    if (this.sharedState) {
      return;
    }

    const currentTeamSize = getTeamSize(this.activePreset.formation);
    const defaultPreset = createDefaultPreset(this.currentSlot, currentTeamSize);
    const currentName = this.activePreset.name;
    this.savePreset(this.currentSlot, { ...defaultPreset, name: currentName });
  }

  createShareHash(): string {
    return this.storage.encodeShareHash(this.state);
  }

  private get activePreset(): BoardState {
    return this.presets.get(this.currentSlot)!;
  }

  private editActivePreset(edit: (preset: BoardState) => void) {
    if (this.sharedState) {
      return;
    }

    edit(this.activePreset);
    this.storage.savePreset(this.currentSlot, this.activePreset);
  }

  private savePreset(slot: number, state: BoardState) {
    this.presets.set(slot, state);
    this.storage.savePreset(slot, state);
  }

  private findEmptySlot(): number | null {
    for (let slot = 1; slot <= MAX_PRESET_COUNT; slot++) {
      if (!this.presets.has(slot)) {
        return slot;
      }
    }

    return null;
  }
}

function createDefaultPreset(slot: number, teamSize: TeamSize = DEFAULT_TEAM_SIZE): BoardState {
  const formation = getDefaultFormation(teamSize);
  const positions = getFormationPositions(formation);
  const players = positions.map((position, i) => ({
    name: getDefaultPlayerName(i),
    ...position,
  }));

  return {
    name: `${DEFAULT_PRESET_NAME_PREFIX}${slot}`,
    formation,
    color: DEFAULT_JERSEY_COLOR,
    gkColor: DEFAULT_GK_JERSEY_COLOR,
    players,
  };
}

function getDefaultPlayerName(index: number): string {
  return `${DEFAULT_PLAYER_NAME_PREFIX}${index + 1}`;
}
