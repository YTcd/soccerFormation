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
  onPlayerNameChange(index: number, name: string): void;
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

function getElement<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

export class PanelView {
  private readonly presetSection = getElement('presetSection');
  private readonly presetSelect = getElement<HTMLSelectElement>('preset');
  private readonly presetNameInput = getElement<HTMLInputElement>('presetName');
  private readonly presetDeleteButton = getElement<HTMLButtonElement>('presetDelete');

  private readonly sharedBanner = getElement('sharedBanner');
  private readonly sharedName = getElement('sharedName');
  private readonly sharedSaveButton = getElement<HTMLButtonElement>('sharedSave');
  private readonly sharedFullMessage = getElement('sharedFull');

  private readonly editor = getElement<HTMLFieldSetElement>('editor');
  private readonly formationSelect = getElement<HTMLSelectElement>('formation');
  private readonly colorInputs: Record<ColorKey, HTMLInputElement> = {
    color: getElement('color'),
    gkColor: getElement('gkColor'),
  };
  private readonly playerNameInputs: HTMLInputElement[] = [];
  private readonly resetButton = getElement<HTMLButtonElement>('reset');

  private readonly toastMessage = getElement<HTMLParagraphElement>('toast');
  private toastTimer?: number;

  constructor() {
    this.presetNameInput.maxLength = PRESET_NAME_MAX_LENGTH;
    this.sharedFullMessage.textContent = PRESETS_FULL_MESSAGE;

    for (const name of FORMATION_NAMES) {
      this.formationSelect.add(new Option(name, name));
    }

    for (let i = 0; i < PLAYER_COUNT; i++) {
      this.playerNameInputs.push(this.createPlayerNameInput(i));
    }
  }

  setHandlers(handlers: PanelHandlers) {
    this.bindPresetEvents(handlers);
    this.bindSharedViewEvents(handlers);
    this.bindEditorEvents(handlers);
    this.bindActionEvents(handlers);
  }

  render({ state, presets, activeSlot, isSharedView, canAddPreset }: PanelData) {
    this.renderPresetSelector(presets, activeSlot, canAddPreset);

    this.presetSection.hidden = isSharedView;
    this.sharedBanner.hidden = !isSharedView;
    this.sharedName.textContent = `'${state.name}'`;
    this.sharedSaveButton.disabled = !canAddPreset;
    this.sharedFullMessage.hidden = canAddPreset;
    this.editor.disabled = isSharedView;
    this.resetButton.disabled = isSharedView;

    this.formationSelect.value = state.formation;
    this.colorInputs.color.value = state.color;
    this.colorInputs.gkColor.value = state.gkColor;

    for (let i = 0; i < this.playerNameInputs.length; i++) {
      this.playerNameInputs[i].value = state.players[i].name;
    }
  }

  showToast(message: string) {
    this.toastMessage.textContent = message;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.textContent = '';
    }, TOAST_DURATION_MS);
  }

  private bindPresetEvents(handlers: PanelHandlers) {
    this.presetSelect.addEventListener('change', () => {
      const selectedValue = this.presetSelect.value;

      if (selectedValue === ADD_PRESET_OPTION_VALUE) {
        handlers.onPresetAdd();
      } else {
        handlers.onPresetSelect(Number(selectedValue));
      }
    });

    this.presetNameInput.addEventListener('input', () => {
      handlers.onPresetRename(this.presetNameInput.value);
    });

    this.presetDeleteButton.addEventListener('click', () => {
      if (confirm(DELETE_PRESET_CONFIRM_MESSAGE)) {
        handlers.onPresetDelete();
      }
    });
  }

  private bindSharedViewEvents(handlers: PanelHandlers) {
    this.sharedSaveButton.addEventListener('click', () => handlers.onSharedSave());
    getElement('sharedLeave').addEventListener('click', () => handlers.onSharedLeave());
  }

  private bindEditorEvents(handlers: PanelHandlers) {
    this.formationSelect.addEventListener('change', () => {
      handlers.onFormationChange(this.formationSelect.value as FormationName);
    });

    const colorEntries = Object.entries(this.colorInputs) as [ColorKey, HTMLInputElement][];
    for (const [key, input] of colorEntries) {
      input.addEventListener('input', () => handlers.onColorChange(key, input.value));
    }

    this.playerNameInputs.forEach((input, index) => {
      input.addEventListener('input', () => handlers.onPlayerNameChange(index, input.value));
    });
  }

  private bindActionEvents(handlers: PanelHandlers) {
    getElement('share').addEventListener('click', () => handlers.onShare());
    getElement('download').addEventListener('click', () => handlers.onDownload());

    this.resetButton.addEventListener('click', () => {
      if (confirm(RESET_CONFIRM_MESSAGE)) {
        handlers.onReset();
      }
    });
  }

  private renderPresetSelector(presets: PresetSummary[], activeSlot: number, canAddPreset: boolean) {
    const presetOptions = presets.map((preset) => {
      const label = preset.name || `#${preset.slot}`;
      return new Option(label, String(preset.slot));
    });
    this.presetSelect.replaceChildren(...presetOptions);

    if (canAddPreset) {
      this.presetSelect.add(new Option(ADD_PRESET_OPTION_LABEL, ADD_PRESET_OPTION_VALUE));
    }

    this.presetSelect.value = String(activeSlot);

    const activePreset = presets.find((preset) => preset.slot === activeSlot);
    this.presetNameInput.value = activePreset?.name ?? '';
    this.presetDeleteButton.disabled = activeSlot === BASE_PRESET_SLOT;
  }

  private createPlayerNameInput(index: number): HTMLInputElement {
    const isGoalkeeper = index === GOALKEEPER_INDEX;

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = NAME_MAX_LENGTH;
    input.placeholder = isGoalkeeper ? GK_NAME_PLACEHOLDER : `${PLAYER_NAME_PLACEHOLDER_PREFIX}${index + 1}`;

    const listItem = document.createElement('li');
    listItem.append(input);
    getElement('names').append(listItem);

    return input;
  }
}
