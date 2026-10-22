import { GOALKEEPER_INDEX, PLAYER_COUNT } from '../const/BoardCONST';
import { FORMATION_NAMES } from '../const/FormationCONST';
import { BASE_PRESET_SLOT } from '../const/PresetCONST';
import {
  ADD_PRESET_OPTION_LABEL,
  ADD_PRESET_OPTION_VALUE,
  DELETE_PRESET_CONFIRM_MESSAGE,
  GK_NAME_PLACEHOLDER,
  NAME_MAX_LENGTH,
  PLAYER_NAME_PLACEHOLDER_PREFIX,
  PRESET_NAME_MAX_LENGTH,
  PRESETS_FULL_MESSAGE,
  RESET_CONFIRM_MESSAGE,
  TOAST_DURATION_MS,
} from '../const/UICONST';
import type { BoardState, ColorKey, FormationName, PresetSummary } from '../model/types';

export type PanelHandlers = {
  onPresetSelect(slot: number): void;
  onPresetAdd(): void;
  onPresetRename(name: string): void;
  onPresetDelete(): void;
  onSharedSave(): void;
  onSharedLeave(): void;
  onFormationChange(name: FormationName): void;
  onColorChange(key: ColorKey, value: string): void;
  onNameChange(index: number, name: string): void;
  onShare(): void;
  onDownload(): void;
  onReset(): void;
};

export type PanelData = {
  state: Readonly<BoardState>;
  presets: PresetSummary[];
  activeSlot: number;
  isSharedView: boolean;
  canAddPreset: boolean;
};

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export class PanelView {
  private readonly presetSection = byId('presetSection');
  private readonly preset = byId<HTMLSelectElement>('preset');
  private readonly presetName = byId<HTMLInputElement>('presetName');
  private readonly presetDelete = byId<HTMLButtonElement>('presetDelete');

  private readonly sharedBanner = byId('sharedBanner');
  private readonly sharedName = byId('sharedName');
  private readonly sharedSave = byId<HTMLButtonElement>('sharedSave');
  private readonly sharedFull = byId('sharedFull');

  private readonly editor = byId<HTMLFieldSetElement>('editor');
  private readonly formation = byId<HTMLSelectElement>('formation');
  private readonly colors: Record<ColorKey, HTMLInputElement> = {
    color: byId('color'),
    gkColor: byId('gkColor'),
  };
  private readonly nameInputs: HTMLInputElement[];
  private readonly reset = byId<HTMLButtonElement>('reset');

  private readonly toastEl = byId<HTMLParagraphElement>('toast');
  private toastTimer?: number;

  constructor() {
    this.presetName.maxLength = PRESET_NAME_MAX_LENGTH;
    this.sharedFull.textContent = PRESETS_FULL_MESSAGE;
    for (const name of FORMATION_NAMES) this.formation.add(new Option(name, name));
    this.nameInputs = Array.from({ length: PLAYER_COUNT }, (_, i) => this.createNameInput(i));
  }

  bind(h: PanelHandlers) {
    this.preset.addEventListener('change', () => {
      if (this.preset.value === ADD_PRESET_OPTION_VALUE) h.onPresetAdd();
      else h.onPresetSelect(Number(this.preset.value));
    });
    this.presetName.addEventListener('input', () => h.onPresetRename(this.presetName.value));
    this.presetDelete.addEventListener('click', () => {
      if (confirm(DELETE_PRESET_CONFIRM_MESSAGE)) h.onPresetDelete();
    });
    this.sharedSave.addEventListener('click', () => h.onSharedSave());
    byId('sharedLeave').addEventListener('click', () => h.onSharedLeave());

    this.formation.addEventListener('change', () => h.onFormationChange(this.formation.value as FormationName));
    for (const [key, input] of Object.entries(this.colors) as [ColorKey, HTMLInputElement][]) {
      input.addEventListener('input', () => h.onColorChange(key, input.value));
    }
    this.nameInputs.forEach((input, i) => input.addEventListener('input', () => h.onNameChange(i, input.value)));

    byId('share').addEventListener('click', () => h.onShare());
    byId('download').addEventListener('click', () => h.onDownload());
    this.reset.addEventListener('click', () => {
      if (confirm(RESET_CONFIRM_MESSAGE)) h.onReset();
    });
  }

  sync({ state, presets, activeSlot, isSharedView, canAddPreset }: PanelData) {
    this.syncPresets(presets, activeSlot, canAddPreset);

    this.presetSection.hidden = isSharedView;
    this.sharedBanner.hidden = !isSharedView;
    this.sharedName.textContent = `'${state.name}'`;
    this.sharedSave.disabled = !canAddPreset;
    this.sharedFull.hidden = canAddPreset;
    this.editor.disabled = isSharedView;
    this.reset.disabled = isSharedView;

    this.formation.value = state.formation;
    this.colors.color.value = state.color;
    this.colors.gkColor.value = state.gkColor;
    this.nameInputs.forEach((input, i) => (input.value = state.players[i].name));
  }

  toast(message: string) {
    this.toastEl.textContent = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastEl.textContent = ''), TOAST_DURATION_MS);
  }

  private syncPresets(presets: PresetSummary[], activeSlot: number, canAddPreset: boolean) {
    this.preset.replaceChildren(...presets.map((p) => new Option(p.name || `#${p.slot}`, String(p.slot))));
    if (canAddPreset) this.preset.add(new Option(ADD_PRESET_OPTION_LABEL, ADD_PRESET_OPTION_VALUE));
    this.preset.value = String(activeSlot);

    this.presetName.value = presets.find((p) => p.slot === activeSlot)?.name ?? '';
    this.presetDelete.disabled = activeSlot === BASE_PRESET_SLOT;
  }

  private createNameInput(index: number): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = NAME_MAX_LENGTH;
    input.placeholder = index === GOALKEEPER_INDEX ? GK_NAME_PLACEHOLDER : `${PLAYER_NAME_PLACEHOLDER_PREFIX}${index + 1}`;
    const li = document.createElement('li');
    li.append(input);
    byId('names').append(li);
    return input;
  }
}
