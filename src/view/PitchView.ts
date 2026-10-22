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

const LINE_STYLE = { width: LINE_WIDTH, color: LINE_COLOR, alpha: LINE_ALPHA };
const CENTER_X_M = FIELD_WIDTH_M / 2;
const HALFWAY_Y_M = FIELD_LENGTH_M / 2;

function metersToPx(meters: number): number {
  return meters * PX_PER_METER;
}

export class PitchView extends Container {
  constructor() {
    super();
    this.addChild(this.createGrass(), this.createLineMarkings());
  }

  private createGrass(): Graphics {
    const graphics = new Graphics().rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).fill(GRASS_COLOR);
    const stripeHeight = FIELD_HEIGHT_PX / GRASS_STRIPE_COUNT;

    for (let i = 0; i < GRASS_STRIPE_COUNT; i += 2) {
      const stripeY = CANVAS_MARGIN + i * stripeHeight;
      graphics.rect(0, stripeY, CANVAS_WIDTH, stripeHeight).fill(GRASS_STRIPE_COLOR);
    }

    return graphics;
  }

  private createLineMarkings(): Graphics {
    const graphics = new Graphics();
    graphics.position.set(CANVAS_MARGIN, CANVAS_MARGIN);

    this.drawOutlineAndCenter(graphics);
    this.drawGoalSide(graphics, true);
    this.drawGoalSide(graphics, false);
    this.drawCornerArcs(graphics);

    return graphics;
  }

  private drawOutlineAndCenter(graphics: Graphics) {
    const fieldWidth = metersToPx(FIELD_WIDTH_M);
    const fieldLength = metersToPx(FIELD_LENGTH_M);
    const centerX = metersToPx(CENTER_X_M);
    const halfwayY = metersToPx(HALFWAY_Y_M);

    graphics.rect(0, 0, fieldWidth, fieldLength).stroke(LINE_STYLE);
    graphics.moveTo(0, halfwayY).lineTo(fieldWidth, halfwayY).stroke(LINE_STYLE);
    graphics.circle(centerX, halfwayY, metersToPx(CENTER_CIRCLE_RADIUS_M)).stroke(LINE_STYLE);
    graphics.circle(centerX, halfwayY, SPOT_RADIUS_PX).fill(LINE_COLOR);
  }

  private drawGoalSide(graphics: Graphics, isTopSide: boolean) {
    const centerX = metersToPx(CENTER_X_M);

    const distanceFromGoalLineToY = (distanceM: number) => {
      const yM = isTopSide ? distanceM : FIELD_LENGTH_M - distanceM;
      return metersToPx(yM);
    };

    const drawBoxFromGoalLine = (widthM: number, depthM: number) => {
      const x = metersToPx(CENTER_X_M - widthM / 2);
      const y = Math.min(distanceFromGoalLineToY(0), distanceFromGoalLineToY(depthM));
      graphics.rect(x, y, metersToPx(widthM), metersToPx(depthM)).stroke(LINE_STYLE);
    };

    drawBoxFromGoalLine(PENALTY_AREA_WIDTH_M, PENALTY_AREA_DEPTH_M);
    drawBoxFromGoalLine(GOAL_AREA_WIDTH_M, GOAL_AREA_DEPTH_M);

    const goalX = metersToPx(CENTER_X_M - GOAL_WIDTH_M / 2);
    const goalY = isTopSide ? -metersToPx(GOAL_DEPTH_M) : metersToPx(FIELD_LENGTH_M);
    graphics.rect(goalX, goalY, metersToPx(GOAL_WIDTH_M), metersToPx(GOAL_DEPTH_M)).stroke(LINE_STYLE);

    const penaltySpotY = distanceFromGoalLineToY(PENALTY_SPOT_DISTANCE_M);
    graphics.circle(centerX, penaltySpotY, SPOT_RADIUS_PX).fill(LINE_COLOR);

    const arcHalfAngle = Math.acos((PENALTY_AREA_DEPTH_M - PENALTY_SPOT_DISTANCE_M) / PENALTY_ARC_RADIUS_M);
    const arcCenterAngle = isTopSide ? Math.PI / 2 : -Math.PI / 2;
    this.drawArc(
      graphics,
      centerX,
      penaltySpotY,
      metersToPx(PENALTY_ARC_RADIUS_M),
      arcCenterAngle - arcHalfAngle,
      arcCenterAngle + arcHalfAngle,
    );
  }

  private drawCornerArcs(graphics: Graphics) {
    const corners: [number, number][] = [
      [0, 0],
      [FIELD_WIDTH_M, 0],
      [FIELD_WIDTH_M, FIELD_LENGTH_M],
      [0, FIELD_LENGTH_M],
    ];

    corners.forEach(([xM, yM], i) => {
      const startAngle = (i * Math.PI) / 2;
      const endAngle = startAngle + Math.PI / 2;
      this.drawArc(graphics, metersToPx(xM), metersToPx(yM), metersToPx(CORNER_ARC_RADIUS_M), startAngle, endAngle);
    });
  }

  private drawArc(
    graphics: Graphics,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);

    graphics.moveTo(startX, startY).arc(centerX, centerY, radius, startAngle, endAngle).stroke(LINE_STYLE);
  }
}
