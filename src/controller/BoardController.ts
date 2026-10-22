import {
  IMAGE_FILE_PREFIX,
  IMAGE_SAVED_MESSAGE,
  SHARE_COPIED_MESSAGE,
  SHARE_FALLBACK_MESSAGE,
  SHARED_SAVED_MESSAGE,
} from '../const/UICONST';
import type { BoardModel } from '../model/BoardModel';
import type { BoardView } from '../view/BoardView';
import type { PanelView } from '../view/PanelView';

/** Turns view events into model changes, then refreshes the views. */
export class BoardController {
  constructor(
    private readonly model: BoardModel,
    private readonly board: BoardView,
    private readonly panel: PanelView,
  ) {}

  start() {
    const m = this.model;

    // The board already shows the dragged position, so only the model is updated.
    this.board.bind({
      onPlayerMove: (index, pos) => m.movePlayer(index, pos),
    });

    this.panel.bind({
      onPresetSelect: (slot) => this.update(() => m.selectPreset(slot)),
      onPresetAdd: () => this.update(() => m.addPreset()),
      onPresetRename: (name) => this.update(() => m.renamePreset(name)),
      onPresetDelete: () => this.update(() => m.deletePreset()),
      onSharedSave: () => {
        this.update(() => m.saveSharedAsPreset());
        this.panel.toast(SHARED_SAVED_MESSAGE);
      },
      onSharedLeave: () => this.update(() => m.leaveSharedView()),
      onFormationChange: (name) => this.update(() => m.setFormation(name)),
      onColorChange: (key, value) => this.update(() => m.setColor(key, value)),
      onNameChange: (index, name) => this.update(() => m.setName(index, name)),
      onReset: () => this.update(() => m.reset()),
      onShare: () => this.copyShareLink(),
      onDownload: () => this.downloadImage(),
    });

    // A share link pasted into an already open tab only changes the hash, without reloading.
    window.addEventListener('hashchange', () => this.update(() => m.openSharedLink()));

    this.refresh();
  }

  private update(change: () => void) {
    change();
    this.refresh();
  }

  private refresh() {
    const m = this.model;
    this.panel.sync({
      state: m.state,
      presets: m.presetList,
      activeSlot: m.activeSlot,
      isSharedView: m.isSharedView,
      canAddPreset: m.canAddPreset,
    });
    this.board.render(m.state);
    this.board.setEditable(!m.isSharedView);
  }

  private async copyShareLink() {
    const url = `${location.origin}${location.pathname}#${this.model.shareHash()}`;
    try {
      await navigator.clipboard.writeText(url);
      this.panel.toast(SHARE_COPIED_MESSAGE);
    } catch {
      prompt(SHARE_FALLBACK_MESSAGE, url);
    }
  }

  private async downloadImage() {
    await this.board.saveImage(`${IMAGE_FILE_PREFIX}${this.model.state.formation}.png`);
    this.panel.toast(IMAGE_SAVED_MESSAGE);
  }
}
