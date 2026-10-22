import { Container, Graphics } from 'pixi.js';
import { CANVAS_HEIGHT, CANVAS_MARGIN, CANVAS_WIDTH, FIELD_HEIGHT_PX, PX_PER_METER } from '../const/LayoutCONST';
import {
  CENTER_CIRCLE_RADIUS_M,
  CORNER_ARC_RADIUS_M,
  FIELD_LENGTH_M,
  FIELD_WIDTH_M,
  GOAL_AREA_DEPTH_M,
  GOAL_AREA_WIDTH_M,
  GOAL_DEPTH_M,
  GOAL_WIDTH_M,
  GRASS_COLOR,
  GRASS_STRIPE_COLOR,
  GRASS_STRIPE_COUNT,
  LINE_ALPHA,
  LINE_COLOR,
  LINE_WIDTH,
  PENALTY_ARC_RADIUS_M,
  PENALTY_AREA_DEPTH_M,
  PENALTY_AREA_WIDTH_M,
  PENALTY_SPOT_DISTANCE_M,
  SPOT_RADIUS_PX,
} from '../const/PitchCONST';

const LINE = { width: LINE_WIDTH, color: LINE_COLOR, alpha: LINE_ALPHA };
const CENTER_X_M = FIELD_WIDTH_M / 2;
const HALFWAY_M = FIELD_LENGTH_M / 2;

const m = (meters: number) => meters * PX_PER_METER;

export class PitchView extends Container {
  constructor() {
    super();
    this.addChild(this.createGrass(), this.createMarkings());
  }

  private createGrass(): Graphics {
    const g = new Graphics().rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).fill(GRASS_COLOR);
    const stripe = FIELD_HEIGHT_PX / GRASS_STRIPE_COUNT;
    for (let i = 0; i < GRASS_STRIPE_COUNT; i += 2) {
      g.rect(0, CANVAS_MARGIN + i * stripe, CANVAS_WIDTH, stripe).fill(GRASS_STRIPE_COLOR);
    }
    return g;
  }

  private createMarkings(): Graphics {
    const g = new Graphics();
    g.position.set(CANVAS_MARGIN, CANVAS_MARGIN);
    this.drawCenter(g);
    this.drawGoalArea(g, true);
    this.drawGoalArea(g, false);
    this.drawCorners(g);
    return g;
  }

  private drawCenter(g: Graphics) {
    g.rect(0, 0, m(FIELD_WIDTH_M), m(FIELD_LENGTH_M)).stroke(LINE);
    g.moveTo(0, m(HALFWAY_M)).lineTo(m(FIELD_WIDTH_M), m(HALFWAY_M)).stroke(LINE);
    g.circle(m(CENTER_X_M), m(HALFWAY_M), m(CENTER_CIRCLE_RADIUS_M)).stroke(LINE);
    g.circle(m(CENTER_X_M), m(HALFWAY_M), SPOT_RADIUS_PX).fill(LINE_COLOR);
  }

  private drawGoalArea(g: Graphics, top: boolean) {
    const y = (d: number) => m(top ? d : FIELD_LENGTH_M - d);
    const box = (width: number, depth: number) =>
      g.rect(m(CENTER_X_M - width / 2), Math.min(y(0), y(depth)), m(width), m(depth)).stroke(LINE);

    box(PENALTY_AREA_WIDTH_M, PENALTY_AREA_DEPTH_M);
    box(GOAL_AREA_WIDTH_M, GOAL_AREA_DEPTH_M);
    g.rect(m(CENTER_X_M - GOAL_WIDTH_M / 2), top ? -m(GOAL_DEPTH_M) : m(FIELD_LENGTH_M), m(GOAL_WIDTH_M), m(GOAL_DEPTH_M))
      .stroke(LINE);
    g.circle(m(CENTER_X_M), y(PENALTY_SPOT_DISTANCE_M), SPOT_RADIUS_PX).fill(LINE_COLOR);

    const half = Math.acos((PENALTY_AREA_DEPTH_M - PENALTY_SPOT_DISTANCE_M) / PENALTY_ARC_RADIUS_M);
    const dir = top ? Math.PI / 2 : -Math.PI / 2;
    this.drawArc(g, m(CENTER_X_M), y(PENALTY_SPOT_DISTANCE_M), m(PENALTY_ARC_RADIUS_M), dir - half, dir + half);
  }

  private drawCorners(g: Graphics) {
    const corners: [number, number][] = [[0, 0], [FIELD_WIDTH_M, 0], [FIELD_WIDTH_M, FIELD_LENGTH_M], [0, FIELD_LENGTH_M]];
    corners.forEach(([x, y], i) => {
      const start = (i * Math.PI) / 2;
      this.drawArc(g, m(x), m(y), m(CORNER_ARC_RADIUS_M), start, start + Math.PI / 2);
    });
  }

  private drawArc(g: Graphics, cx: number, cy: number, r: number, start: number, end: number) {
    g.moveTo(cx + r * Math.cos(start), cy + r * Math.sin(start)).arc(cx, cy, r, start, end).stroke(LINE);
  }
}
