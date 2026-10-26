import { DELETE_RADAR_PLAYER_CONFIRM_MESSAGE, MAX_RADAR_PLAYER_COUNT, MAX_TOTAL } from '../const/RadarCONST';
import { NAME_MAX_LENGTH, TOAST_DURATION_MS } from '../const/UICONST';
import type { RadarPlayerSummary } from '../model/types';

export type RadarPanelHandlers = {
  onPlayerSelect(index: number): void;
  onPlayerAdd(): void;
  onPlayerRename(name: string): void;
  onPlayerDelete(): void;
  onExportFile(): void;
  onExportCopy(): void;
};

export type RadarPanelData = {
  players: RadarPlayerSummary[];
  activeIndex: number;
  total: number;
  canAddPlayer: boolean;
  canDeletePlayer: boolean;
};

function getElement<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

export class RadarPanelView {
  private readonly playerCount = getElement('playerCount');
  private readonly playerList = getElement<HTMLOListElement>('playerList');
  private readonly playerAddButton = getElement<HTMLButtonElement>('playerAdd');
  private readonly playerNameInput = getElement<HTMLInputElement>('playerName');
  private readonly playerDeleteButton = getElement<HTMLButtonElement>('playerDelete');
  private readonly totalValue = getElement('total');

  private readonly toastMessage = getElement<HTMLParagraphElement>('toast');
  private toastTimer?: number;

  constructor() {
    this.playerNameInput.maxLength = NAME_MAX_LENGTH;
    getElement('totalMax').textContent = `/ ${MAX_TOTAL}`;
  }

  setHandlers(handlers: RadarPanelHandlers) {
    this.playerList.addEventListener('click', (event) => {
      const item = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
      if (item) {
        handlers.onPlayerSelect(Number(item.dataset.index));
      }
    });

    this.playerAddButton.addEventListener('click', () => handlers.onPlayerAdd());

    this.playerNameInput.addEventListener('input', () => {
      handlers.onPlayerRename(this.playerNameInput.value);
    });

    this.playerDeleteButton.addEventListener('click', () => {
      if (confirm(DELETE_RADAR_PLAYER_CONFIRM_MESSAGE)) {
        handlers.onPlayerDelete();
      }
    });

    getElement('exportFile').addEventListener('click', () => handlers.onExportFile());
    getElement('exportCopy').addEventListener('click', () => handlers.onExportCopy());
  }

  render({ players, activeIndex, total, canAddPlayer, canDeletePlayer }: RadarPanelData) {
    const playerItems = players.map((player, i) => createPlayerItem(player, i, i === activeIndex));
    this.playerList.replaceChildren(...playerItems);
    this.playerCount.textContent = `(${players.length}/${MAX_RADAR_PLAYER_COUNT})`;
    this.playerAddButton.disabled = !canAddPlayer;

    this.playerNameInput.value = players[activeIndex].name;
    this.playerDeleteButton.disabled = !canDeletePlayer;
    this.totalValue.textContent = String(total);
  }

  showToast(message: string) {
    this.toastMessage.textContent = message;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.textContent = '';
    }, TOAST_DURATION_MS);
  }
}

function createPlayerItem(player: RadarPlayerSummary, index: number, isActive: boolean): HTMLLIElement {
  const name = document.createElement('span');
  name.textContent = player.name || `#${index + 1}`;

  const total = document.createElement('span');
  total.className = 'player-total';
  total.textContent = String(player.total);

  const button = document.createElement('button');
  button.dataset.index = String(index);
  button.classList.toggle('active', isActive);
  button.append(name, total);

  const listItem = document.createElement('li');
  listItem.append(button);
  return listItem;
}
