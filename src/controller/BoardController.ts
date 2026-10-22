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

export class BoardController {
  constructor(
    private readonly model: BoardModel,
    private readonly board: BoardView,
    private readonly panel: PanelView,
  ) {}

  start() {
    const model = this.model;

    this.board.setHandlers({
      onPlayerMove: (index, position) => model.movePlayer(index, position),
    });

    this.panel.setHandlers({
      onPresetSelect: (slot) => this.changeAndRefresh(() => model.selectPreset(slot)),
      onPresetAdd: () => this.changeAndRefresh(() => model.addPreset()),
      onPresetRename: (name) => this.changeAndRefresh(() => model.renamePreset(name)),
      onPresetDelete: () => this.changeAndRefresh(() => model.deletePreset()),
      onSharedSave: () => {
        this.changeAndRefresh(() => model.saveSharedAsPreset());
        this.panel.showToast(SHARED_SAVED_MESSAGE);
      },
      onSharedLeave: () => this.changeAndRefresh(() => model.leaveSharedView()),
      onTeamSizeChange: (teamSize) => this.changeAndRefresh(() => model.setTeamSize(teamSize)),
      onFormationChange: (name) => this.changeAndRefresh(() => model.setFormation(name)),
      onColorChange: (key, value) => this.changeAndRefresh(() => model.setColor(key, value)),
      onPlayerNameChange: (index, name) => this.changeAndRefresh(() => model.setPlayerName(index, name)),
      onReset: () => this.changeAndRefresh(() => model.resetActivePreset()),
      onShare: () => this.copyShareLink(),
      onDownload: () => this.downloadImage(),
    });

    window.addEventListener('hashchange', () => {
      this.changeAndRefresh(() => model.openSharedLink());
    });

    this.refreshViews();
  }

  private changeAndRefresh(change: () => void) {
    change();
    this.refreshViews();
  }

  private refreshViews() {
    const model = this.model;

    this.panel.render({
      state: model.state,
      presets: model.presetList,
      activeSlot: model.activeSlot,
      isSharedView: model.isSharedView,
      canAddPreset: model.canAddPreset,
    });

    this.board.render(model.state);
    this.board.setEditable(!model.isSharedView);
  }

  private async copyShareLink() {
    const shareUrl = `${location.origin}${location.pathname}#${this.model.createShareHash()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      this.panel.showToast(SHARE_COPIED_MESSAGE);
    } catch {
      prompt(SHARE_FALLBACK_MESSAGE, shareUrl);
    }
  }

  private async downloadImage() {
    const filename = `${IMAGE_FILE_PREFIX}${this.model.state.formation}.png`;

    await this.board.saveImage(filename);
    this.panel.showToast(IMAGE_SAVED_MESSAGE);
  }
}
