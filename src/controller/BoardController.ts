import {
  IMAGE_FILE_PREFIX,
  IMAGE_SAVED_MESSAGE,
  SHARE_COPIED_MESSAGE,
  SHARE_FALLBACK_MESSAGE,
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
    this.board.bind({
      onPlayerMove: (index, pos) => this.model.movePlayer(index, pos),
    });

    this.panel.bind({
      onFormationChange: (name) => {
        this.model.setFormation(name);
        this.renderBoard();
      },
      onColorChange: (key, value) => {
        this.model.setColor(key, value);
        this.renderBoard();
      },
      onNameChange: (index, name) => {
        this.model.setName(index, name);
        this.renderBoard();
      },
      onReset: () => {
        this.model.reset();
        this.panel.sync(this.model.state);
        this.renderBoard();
      },
      onShare: () => this.copyShareLink(),
      onDownload: () => this.downloadImage(),
    });

    this.panel.sync(this.model.state);
    this.renderBoard();
  }

  private renderBoard() {
    this.board.render(this.model.state);
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
