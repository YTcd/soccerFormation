import { Application, Container, FederatedPointerEvent, Graphics, Rectangle, type Ticker } from 'pixi.js';
import { GOALKEEPER_INDEX, MAX_PLAYER_COUNT } from '../const/BoardCONST';
import { CANVAS_MARGIN } from '../const/LayoutCONST';
import { GRASS_COLOR } from '../const/PitchCONST';
import { PLAYER_BOTTOM, PLAYER_HALF_WIDTH, PLAYER_SWAP_RADIUS, PLAYER_TOP } from '../const/PlayerCONST';
import type { BoardState, PitchType, Position } from '../model/types';
import { getPitchType, PITCH_LAYOUTS, type PitchLayout } from './pitchLayout';
import { PitchView } from './PitchView';
import { drawJerseyShape, PlayerView } from './PlayerView';

export type BoardHandlers = {
  onPlayerMove(index: number, pos: Position): void;
};

type Drag = {
  player: PlayerView;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  swapTarget: PlayerView | null;
};

const INITIAL_PITCH_TYPE: PitchType = 'soccer';

const SWAP_GHOST_COLOR = 0xffffff;
const SWAP_ANIMATION_MS = 180;

export class BoardView {
  private readonly playerLayer = new Container();
  private readonly players: PlayerView[] = [];
  // Shows where the swap target will land: the dragged player's starting spot.
  private readonly swapGhost = drawJerseyShape(new Graphics())
    .fill({ color: SWAP_GHOST_COLOR, alpha: 0.2 })
    .stroke({ width: 2, color: SWAP_GHOST_COLOR, alpha: 0.8, join: 'round' });
  private readonly animations = new Map<PlayerView, (ticker: Ticker) => void>();
  private pitchType = INITIAL_PITCH_TYPE;
  private pitchView = new PitchView(INITIAL_PITCH_TYPE);
  private drag: Drag | null = null;
  private handlers?: BoardHandlers;

  static async create(parent: HTMLElement): Promise<BoardView> {
    const app = new Application();
    const layout = PITCH_LAYOUTS[INITIAL_PITCH_TYPE];

    await app.init({
      width: layout.canvasWidth,
      height: layout.canvasHeight,
      antialias: true,
      background: GRASS_COLOR,
      resolution: Math.max(2, window.devicePixelRatio),
    });

    parent.append(app.canvas);

    return new BoardView(app);
  }

  private constructor(private readonly app: Application) {
    for (let i = 0; i < MAX_PLAYER_COUNT; i++) {
      this.players.push(this.createPlayer(i));
    }

    this.setupStage();
    this.blockTouchScrollWhileDragging();
    this.updateCanvasAspectRatio();
  }

  private get layout(): PitchLayout {
    return PITCH_LAYOUTS[this.pitchType];
  }

  setHandlers(handlers: BoardHandlers) {
    this.handlers = handlers;
  }

  render(state: Readonly<BoardState>) {
    const pitchType = getPitchType(state.formation);
    if (pitchType !== this.pitchType) {
      this.changePitch(pitchType);
    }

    for (let i = 0; i < this.players.length; i++) {
      const playerView = this.players[i];
      this.stopAnimation(playerView);
      const isInTeam = i < state.players.length;

      playerView.visible = isInTeam;
      if (!isInTeam) {
        continue;
      }

      const playerState = state.players[i];
      const isGoalkeeper = i === GOALKEEPER_INDEX;
      const color = isGoalkeeper ? state.gkColor : state.color;
      playerView.updateAppearance(playerState.name, playerState.role, color);

      const canvasPosition = toCanvasPosition(playerState, this.layout);
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
      frame: new Rectangle(0, 0, this.layout.canvasWidth, this.layout.canvasHeight),
      resolution: 2,
      format: 'png',
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataUrl;
    downloadLink.download = filename;
    downloadLink.click();
  }

  private setupStage() {
    const stage = this.app.stage;

    this.swapGhost.visible = false;

    stage.addChild(this.pitchView, this.swapGhost, this.playerLayer);
    stage.eventMode = 'static';
    stage.hitArea = this.app.screen;
    stage.on('globalpointermove', (e) => this.moveDrag(e));
    stage.on('pointerup', () => this.endDrag());
  }

  private changePitch(pitchType: PitchType) {
    this.pitchType = pitchType;

    this.app.stage.removeChild(this.pitchView);
    this.pitchView.destroy({ children: true });
    this.pitchView = new PitchView(pitchType);
    this.app.stage.addChildAt(this.pitchView, 0);

    this.app.renderer.resize(this.layout.canvasWidth, this.layout.canvasHeight);
    this.updateCanvasAspectRatio();
  }

  private updateCanvasAspectRatio() {
    const aspectRatio = `${this.layout.canvasWidth} / ${this.layout.canvasHeight}`;
    this.app.canvas.parentElement?.style.setProperty('--canvas-aspect-ratio', aspectRatio);
  }

  private blockTouchScrollWhileDragging() {
    const canvas = this.app.canvas;
    canvas.style.touchAction = 'pan-y';

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
    this.stopAnimation(player);

    this.drag = {
      player,
      offsetX: player.x - e.global.x,
      offsetY: player.y - e.global.y,
      startX: player.x,
      startY: player.y,
      swapTarget: null,
    };

    this.playerLayer.addChild(player);
    player.cursor = 'grabbing';
  }

  private moveDrag(e: FederatedPointerEvent) {
    if (!this.drag) {
      return;
    }

    const { canvasWidth, canvasHeight } = this.layout;
    const { player, offsetX, offsetY } = this.drag;
    const x = clamp(e.global.x + offsetX, PLAYER_HALF_WIDTH, canvasWidth - PLAYER_HALF_WIDTH);
    const y = clamp(e.global.y + offsetY, PLAYER_TOP, canvasHeight - PLAYER_BOTTOM);

    player.position.set(x, y);
    this.updateSwapPreview(this.drag);
  }

  private endDrag() {
    if (!this.drag) {
      return;
    }

    const { player, startX, startY, swapTarget } = this.drag;
    player.cursor = 'grab';
    this.drag = null;
    this.hideSwapPreview(swapTarget);

    let fieldPosition = toFieldPosition(player.position, this.layout);
    if (swapTarget) {
      fieldPosition = toFieldPosition(swapTarget.position, this.layout);
      this.animateTo(player, swapTarget.x, swapTarget.y);
      this.animateTo(swapTarget, startX, startY);
      this.handlers?.onPlayerMove(swapTarget.index, toFieldPosition({ x: startX, y: startY }, this.layout));
    }

    this.handlers?.onPlayerMove(player.index, fieldPosition);
  }

  private updateSwapPreview(drag: Drag) {
    const swapTarget = this.findSwapTarget(drag.player);
    if (swapTarget === drag.swapTarget) {
      return;
    }

    this.hideSwapPreview(drag.swapTarget);
    drag.swapTarget = swapTarget;

    if (swapTarget) {
      swapTarget.setSwapHighlight(true);
      this.swapGhost.position.set(drag.startX, drag.startY);
      this.swapGhost.visible = true;
    }
  }

  private hideSwapPreview(swapTarget: PlayerView | null) {
    swapTarget?.setSwapHighlight(false);
    this.swapGhost.visible = false;
  }

  private animateTo(player: PlayerView, toX: number, toY: number) {
    this.stopAnimation(player);

    const fromX = player.x;
    const fromY = player.y;
    let elapsedMs = 0;

    const tick = (ticker: Ticker) => {
      elapsedMs += ticker.deltaMS;
      const progress = Math.min(1, elapsedMs / SWAP_ANIMATION_MS);
      const eased = 1 - (1 - progress) ** 3;

      player.position.set(fromX + (toX - fromX) * eased, fromY + (toY - fromY) * eased);

      if (progress === 1) {
        this.stopAnimation(player);
      }
    };

    this.animations.set(player, tick);
    this.app.ticker.add(tick);
  }

  private stopAnimation(player: PlayerView) {
    const tick = this.animations.get(player);
    if (!tick) {
      return;
    }

    this.app.ticker.remove(tick);
    this.animations.delete(player);
  }

  private findSwapTarget(player: PlayerView): PlayerView | null {
    let nearest: PlayerView | null = null;
    let nearestDistance = PLAYER_SWAP_RADIUS;

    for (const other of this.players) {
      if (other === player || !other.visible) {
        continue;
      }

      const distance = Math.hypot(other.x - player.x, other.y - player.y);
      if (distance <= nearestDistance) {
        nearest = other;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}

function toCanvasPosition(fieldPosition: Position, layout: PitchLayout): Position {
  return {
    x: CANVAS_MARGIN + fieldPosition.x * layout.fieldWidthPx,
    y: CANVAS_MARGIN + fieldPosition.y * layout.fieldHeightPx,
  };
}

function toFieldPosition(canvasPosition: Position, layout: PitchLayout): Position {
  return {
    x: (canvasPosition.x - CANVAS_MARGIN) / layout.fieldWidthPx,
    y: (canvasPosition.y - CANVAS_MARGIN) / layout.fieldHeightPx,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
