import { GOALKEEPER_INDEX, PLAYER_COUNT } from '../const/BoardCONST';
import { FORMATION_NAMES } from '../const/FormationCONST';
import {
  GK_NAME_PLACEHOLDER,
  NAME_MAX_LENGTH,
  PLAYER_NAME_PLACEHOLDER_PREFIX,
  RESET_CONFIRM_MESSAGE,
  TOAST_DURATION_MS,
} from '../const/UICONST';
import type { BoardState, ColorKey, FormationName } from '../model/types';

export type PanelHandlers = {
  onFormationChange(name: FormationName): void;
  onColorChange(key: ColorKey, value: string): void;
  onNameChange(index: number, name: string): void;
  onShare(): void;
  onDownload(): void;
  onReset(): void;
};

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/** The side panel (formation, colors, names, buttons) built on the markup in index.html. */
export class PanelView {
  private readonly formation = byId<HTMLSelectElement>('formation');
  private readonly colors: Record<ColorKey, HTMLInputElement> = {
    color: byId('color'),
    gkColor: byId('gkColor'),
  };
  private readonly nameInputs: HTMLInputElement[];
  private readonly toastEl = byId<HTMLParagraphElement>('toast');
  private toastTimer?: number;

  constructor() {
    for (const name of FORMATION_NAMES) this.formation.add(new Option(name, name));
    this.nameInputs = Array.from({ length: PLAYER_COUNT }, (_, i) => this.createNameInput(i));
  }

  bind(h: PanelHandlers) {
    this.formation.addEventListener('change', () => h.onFormationChange(this.formation.value as FormationName));
    for (const [key, input] of Object.entries(this.colors) as [ColorKey, HTMLInputElement][]) {
      input.addEventListener('input', () => h.onColorChange(key, input.value));
    }
    this.nameInputs.forEach((input, i) => input.addEventListener('input', () => h.onNameChange(i, input.value)));

    byId('share').addEventListener('click', () => h.onShare());
    byId('download').addEventListener('click', () => h.onDownload());
    byId('reset').addEventListener('click', () => {
      if (confirm(RESET_CONFIRM_MESSAGE)) h.onReset();
    });
  }

  /** Fills every control from the state. */
  sync(state: Readonly<BoardState>) {
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
