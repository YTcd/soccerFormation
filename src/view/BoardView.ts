import { Application, Container, FederatedPointerEvent, Rectangle } from 'pixi.js';
import { GOALKEEPER_INDEX, PLAYER_COUNT } from '../const/BoardCONST';
import {
  CANVAS_HEIGHT,
  CANVAS_MARGIN,
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

type Drag = { player: PlayerView; dx: number; dy: number };

/** The Pixi canvas: pitch, draggable players and PNG export. */
export class BoardView {
  private readonly playerLayer = new Container();
  private readonly players: PlayerView[];
  private drag: Drag | null = null;
  private handlers?: BoardHandlers;

  /** Pixi needs an async init, so instances are made through create(). */
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
    this.players = Array.from({ length: PLAYER_COUNT }, (_, i) => this.createPlayer(i));
    app.stage.addChild(new PitchView(), this.playerLayer);
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('globalpointermove', (e) => this.moveDrag(e));
    app.stage.on('pointerup', () => this.endDrag());
  }

  bind(handlers: BoardHandlers) {
    this.handlers = handlers;
  }

  render(state: Readonly<BoardState>) {
    state.players.forEach((p, i) => {
      const view = this.players[i];
      view.update(p.name, i === GOALKEEPER_INDEX ? state.gkColor : state.color);
      view.position.set(CANVAS_MARGIN + p.x * FIELD_WIDTH_PX, CANVAS_MARGIN + p.y * FIELD_HEIGHT_PX);
    });
  }

  /** Downloads the whole board as a PNG. */
  async saveImage(filename: string) {
    const a = document.createElement('a');
    a.href = await this.app.renderer.extract.base64({
      target: this.app.stage,
      frame: new Rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
      resolution: EXPORT_RESOLUTION,
      format: 'png',
    });
    a.download = filename;
    a.click();
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
    this.drag = { player, dx: player.x - e.global.x, dy: player.y - e.global.y };
    this.playerLayer.addChild(player); // bring to front
    player.cursor = 'grabbing';
  }

  // Keeps the whole jersey inside the canvas.
  private moveDrag(e: FederatedPointerEvent) {
    if (!this.drag) return;
    const { player, dx, dy } = this.drag;
    player.position.set(
      clamp(e.global.x + dx, PLAYER_HALF_WIDTH, CANVAS_WIDTH - PLAYER_HALF_WIDTH),
      clamp(e.global.y + dy, PLAYER_TOP, CANVAS_HEIGHT - PLAYER_BOTTOM),
    );
  }

  private endDrag() {
    if (!this.drag) return;
    const { player } = this.drag;
    player.cursor = 'grab';
    this.drag = null;
    this.handlers?.onPlayerMove(player.index, {
      x: (player.x - CANVAS_MARGIN) / FIELD_WIDTH_PX,
      y: (player.y - CANVAS_MARGIN) / FIELD_HEIGHT_PX,
    });
  }
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
