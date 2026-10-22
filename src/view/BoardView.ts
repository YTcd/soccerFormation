import { Application, Container, FederatedPointerEvent, Rectangle } from 'pixi.js';
import { GOALKEEPER_INDEX, PLAYER_COUNT } from '../const/BoardCONST';
import {
  CANVAS_HEIGHT,
  CANVAS_MARGIN,
  CANVAS_TOUCH_ACTION,
  CANVAS_WIDTH,
  EXPORT_RESOLUTION,
  FIELD_HEIGHT_PX,
  FIELD_WIDTH_PX,
  MIN_RENDER_RESOLUTION,
} from '../const/LayoutCONST';
import { GRASS_COLOR } from '../const/PitchCONST';
import { PLAYER_BOTTOM, PLAYER_HALF_WIDTH, PLAYER_TOP } from '../const/PlayerCONST';
import type { BoardState, Position } from '../model/types';
import { PitchView } from './PitchView';
import { PlayerView } from './PlayerView';

export type BoardHandlers = {
  onPlayerMove(index: number, pos: Position): void;
};

type Drag = {
  player: PlayerView;
  offsetX: number;
  offsetY: number;
};

export class BoardView {
  private readonly playerLayer = new Container();
  private readonly players: PlayerView[] = [];
  private drag: Drag | null = null;
  private handlers?: BoardHandlers;

  static async create(parent: HTMLElement): Promise<BoardView> {
    const app = new Application();

    await app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      antialias: true,
      background: GRASS_COLOR,
      resolution: Math.max(MIN_RENDER_RESOLUTION, window.devicePixelRatio),
    });

    parent.append(app.canvas);

    return new BoardView(app);
  }

  private constructor(private readonly app: Application) {
    for (let i = 0; i < PLAYER_COUNT; i++) {
      this.players.push(this.createPlayer(i));
    }

    this.setupStage();
    this.blockTouchScrollWhileDragging();
  }

  setHandlers(handlers: BoardHandlers) {
    this.handlers = handlers;
  }

  render(state: Readonly<BoardState>) {
    for (let i = 0; i < state.players.length; i++) {
      const playerState = state.players[i];
      const playerView = this.players[i];

      const isGoalkeeper = i === GOALKEEPER_INDEX;
      const color = isGoalkeeper ? state.gkColor : state.color;
      playerView.updateAppearance(playerState.name, color);

      const canvasPosition = toCanvasPosition(playerState);
      playerView.position.set(canvasPosition.x, canvasPosition.y);
    }
  }

  setEditable(editable: boolean) {
    const eventMode = editable ? 'static' : 'none';

    for (const player of this.players) {
      player.eventMode = eventMode;
    }
  }

  async saveImage(filename: string) {
    const imageDataUrl = await this.app.renderer.extract.base64({
      target: this.app.stage,
      frame: new Rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
      resolution: EXPORT_RESOLUTION,
      format: 'png',
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataUrl;
    downloadLink.download = filename;
    downloadLink.click();
  }

  private setupStage() {
    const stage = this.app.stage;

    stage.addChild(new PitchView(), this.playerLayer);
    stage.eventMode = 'static';
    stage.hitArea = this.app.screen;
    stage.on('globalpointermove', (e) => this.moveDrag(e));
    stage.on('pointerup', () => this.endDrag());
  }

  private blockTouchScrollWhileDragging() {
    const canvas = this.app.canvas;
    canvas.style.touchAction = CANVAS_TOUCH_ACTION;

    const preventScrollIfDragging = (e: TouchEvent) => {
      if (this.drag) {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', preventScrollIfDragging, { passive: false });
    canvas.addEventListener('touchmove', preventScrollIfDragging, { passive: false });
  }

  private createPlayer(index: number): PlayerView {
    const player = new PlayerView(index);

    player.on('pointerdown', (e) => this.startDrag(e, player));
    player.on('pointerup', () => this.endDrag());
    player.on('pointerupoutside', () => this.endDrag());

    this.playerLayer.addChild(player);

    return player;
  }

  private startDrag(e: FederatedPointerEvent, player: PlayerView) {
    this.drag = {
      player,
      offsetX: player.x - e.global.x,
      offsetY: player.y - e.global.y,
    };

    this.playerLayer.addChild(player);
    player.cursor = 'grabbing';
  }

  private moveDrag(e: FederatedPointerEvent) {
    if (!this.drag) {
      return;
    }

    const { player, offsetX, offsetY } = this.drag;
    const x = clamp(e.global.x + offsetX, PLAYER_HALF_WIDTH, CANVAS_WIDTH - PLAYER_HALF_WIDTH);
    const y = clamp(e.global.y + offsetY, PLAYER_TOP, CANVAS_HEIGHT - PLAYER_BOTTOM);

    player.position.set(x, y);
  }

  private endDrag() {
    if (!this.drag) {
      return;
    }

    const { player } = this.drag;
    player.cursor = 'grab';
    this.drag = null;

    const fieldPosition = toFieldPosition(player.position);
    this.handlers?.onPlayerMove(player.index, fieldPosition);
  }
}

function toCanvasPosition(fieldPosition: Position): Position {
  return {
    x: CANVAS_MARGIN + fieldPosition.x * FIELD_WIDTH_PX,
    y: CANVAS_MARGIN + fieldPosition.y * FIELD_HEIGHT_PX,
  };
}

function toFieldPosition(canvasPosition: Position): Position {
  return {
    x: (canvasPosition.x - CANVAS_MARGIN) / FIELD_WIDTH_PX,
    y: (canvasPosition.y - CANVAS_MARGIN) / FIELD_HEIGHT_PX,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
