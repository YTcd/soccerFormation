import { Container, Graphics } from 'pixi.js';
import { CANVAS_MARGIN } from '../const/LayoutCONST';
import {
  FUTSAL_CENTER_CIRCLE_RADIUS_M,
  FUTSAL_CORNER_ARC_RADIUS_M,
  FUTSAL_GOAL_DEPTH_M,
  FUTSAL_GOAL_WIDTH_M,
  FUTSAL_PENALTY_AREA_LINE_LENGTH_M,
  FUTSAL_PENALTY_AREA_RADIUS_M,
  FUTSAL_PENALTY_SPOT_DISTANCE_M,
  FUTSAL_SECOND_PENALTY_SPOT_DISTANCE_M,
  GRASS_COLOR,
  SOCCER_CENTER_CIRCLE_RADIUS_M,
  SOCCER_CORNER_ARC_RADIUS_M,
  SOCCER_GOAL_AREA_DEPTH_M,
  SOCCER_GOAL_AREA_WIDTH_M,
  SOCCER_GOAL_DEPTH_M,
  SOCCER_GOAL_WIDTH_M,
  SOCCER_PENALTY_ARC_RADIUS_M,
  SOCCER_PENALTY_AREA_DEPTH_M,
  SOCCER_PENALTY_AREA_WIDTH_M,
  SOCCER_PENALTY_SPOT_DISTANCE_M,
} from '../const/PitchCONST';
import type { PitchType } from '../model/types';
import { PITCH_LAYOUTS, type PitchLayout } from './pitchLayout';

const GRASS_STRIPE_COLOR = 0x388e3c;
const GRASS_STRIPE_COUNT = 14;
const LINE_STYLE = { width: 2, color: 0xffffff, alpha: 0.9 };
const SPOT_RADIUS_PX = 3;

export class PitchView extends Container {
  private readonly layout: PitchLayout;

  constructor(private readonly pitchType: PitchType) {
    super();
    this.layout = PITCH_LAYOUTS[pitchType];
    this.addChild(this.createGrass(), this.createLineMarkings());
  }

  private createGrass(): Graphics {
    const { canvasWidth, canvasHeight, fieldHeightPx } = this.layout;
    const graphics = new Graphics().rect(0, 0, canvasWidth, canvasHeight).fill(GRASS_COLOR);
    const stripeHeight = fieldHeightPx / GRASS_STRIPE_COUNT;

    for (let i = 0; i < GRASS_STRIPE_COUNT; i += 2) {
      const stripeY = CANVAS_MARGIN + i * stripeHeight;
      graphics.rect(0, stripeY, canvasWidth, stripeHeight).fill(GRASS_STRIPE_COLOR);
    }

    return graphics;
  }

  private createLineMarkings(): Graphics {
    const graphics = new Graphics();
    graphics.position.set(CANVAS_MARGIN, CANVAS_MARGIN);

    if (this.pitchType === 'soccer') {
      this.drawSoccerMarkings(graphics);
    } else {
      this.drawFutsalMarkings(graphics);
    }

    return graphics;
  }

  private drawSoccerMarkings(graphics: Graphics) {
    this.drawOutlineAndCenter(graphics, SOCCER_CENTER_CIRCLE_RADIUS_M);
    this.drawSoccerGoalSide(graphics, true);
    this.drawSoccerGoalSide(graphics, false);
    this.drawCornerArcs(graphics, SOCCER_CORNER_ARC_RADIUS_M);
  }

  private drawFutsalMarkings(graphics: Graphics) {
    this.drawOutlineAndCenter(graphics, FUTSAL_CENTER_CIRCLE_RADIUS_M);
    this.drawFutsalGoalSide(graphics, true);
    this.drawFutsalGoalSide(graphics, false);
    this.drawCornerArcs(graphics, FUTSAL_CORNER_ARC_RADIUS_M);
  }

  private drawOutlineAndCenter(graphics: Graphics, centerCircleRadiusM: number) {
    const { fieldWidthPx, fieldHeightPx } = this.layout;
    const centerX = fieldWidthPx / 2;
    const halfwayY = fieldHeightPx / 2;

    graphics.rect(0, 0, fieldWidthPx, fieldHeightPx).stroke(LINE_STYLE);
    graphics.moveTo(0, halfwayY).lineTo(fieldWidthPx, halfwayY).stroke(LINE_STYLE);
    graphics.circle(centerX, halfwayY, this.metersToPx(centerCircleRadiusM)).stroke(LINE_STYLE);
    graphics.circle(centerX, halfwayY, SPOT_RADIUS_PX).fill(LINE_STYLE.color);
  }

  private drawSoccerGoalSide(graphics: Graphics, isTopSide: boolean) {
    this.drawBoxFromGoalLine(graphics, isTopSide, SOCCER_PENALTY_AREA_WIDTH_M, SOCCER_PENALTY_AREA_DEPTH_M);
    this.drawBoxFromGoalLine(graphics, isTopSide, SOCCER_GOAL_AREA_WIDTH_M, SOCCER_GOAL_AREA_DEPTH_M);
    this.drawGoal(graphics, isTopSide, SOCCER_GOAL_WIDTH_M, SOCCER_GOAL_DEPTH_M);
    this.drawSpot(graphics, isTopSide, SOCCER_PENALTY_SPOT_DISTANCE_M);

    const centerX = this.layout.fieldWidthPx / 2;
    const penaltySpotY = this.distanceFromGoalLineToY(isTopSide, SOCCER_PENALTY_SPOT_DISTANCE_M);
    const arcHalfAngle = Math.acos(
      (SOCCER_PENALTY_AREA_DEPTH_M - SOCCER_PENALTY_SPOT_DISTANCE_M) / SOCCER_PENALTY_ARC_RADIUS_M,
    );
    const arcCenterAngle = isTopSide ? Math.PI / 2 : -Math.PI / 2;

    this.drawArc(
      graphics,
      centerX,
      penaltySpotY,
      this.metersToPx(SOCCER_PENALTY_ARC_RADIUS_M),
      arcCenterAngle - arcHalfAngle,
      arcCenterAngle + arcHalfAngle,
    );
  }

  private drawFutsalGoalSide(graphics: Graphics, isTopSide: boolean) {
    const centerXM = this.layout.fieldWidthM / 2;
    const halfLineLengthM = FUTSAL_PENALTY_AREA_LINE_LENGTH_M / 2;
    const leftArcCenterX = this.metersToPx(centerXM - halfLineLengthM);
    const rightArcCenterX = this.metersToPx(centerXM + halfLineLengthM);
    const goalLineY = this.distanceFromGoalLineToY(isTopSide, 0);
    const areaLineY = this.distanceFromGoalLineToY(isTopSide, FUTSAL_PENALTY_AREA_RADIUS_M);
    const radius = this.metersToPx(FUTSAL_PENALTY_AREA_RADIUS_M);

    const [leftStartAngle, leftEndAngle] = isTopSide ? [Math.PI / 2, Math.PI] : [Math.PI, Math.PI * 1.5];
    const [rightStartAngle, rightEndAngle] = isTopSide ? [0, Math.PI / 2] : [-Math.PI / 2, 0];

    this.drawArc(graphics, leftArcCenterX, goalLineY, radius, leftStartAngle, leftEndAngle);
    this.drawArc(graphics, rightArcCenterX, goalLineY, radius, rightStartAngle, rightEndAngle);
    graphics.moveTo(leftArcCenterX, areaLineY).lineTo(rightArcCenterX, areaLineY).stroke(LINE_STYLE);

    this.drawGoal(graphics, isTopSide, FUTSAL_GOAL_WIDTH_M, FUTSAL_GOAL_DEPTH_M);
    this.drawSpot(graphics, isTopSide, FUTSAL_PENALTY_SPOT_DISTANCE_M);
    this.drawSpot(graphics, isTopSide, FUTSAL_SECOND_PENALTY_SPOT_DISTANCE_M);
  }

  private drawBoxFromGoalLine(graphics: Graphics, isTopSide: boolean, widthM: number, depthM: number) {
    const x = this.metersToPx(this.layout.fieldWidthM / 2 - widthM / 2);
    const y = Math.min(this.distanceFromGoalLineToY(isTopSide, 0), this.distanceFromGoalLineToY(isTopSide, depthM));

    graphics.rect(x, y, this.metersToPx(widthM), this.metersToPx(depthM)).stroke(LINE_STYLE);
  }

  private drawGoal(graphics: Graphics, isTopSide: boolean, widthM: number, depthM: number) {
    const x = this.metersToPx(this.layout.fieldWidthM / 2 - widthM / 2);
    const y = isTopSide ? -this.metersToPx(depthM) : this.layout.fieldHeightPx;

    graphics.rect(x, y, this.metersToPx(widthM), this.metersToPx(depthM)).stroke(LINE_STYLE);
  }

  private drawSpot(graphics: Graphics, isTopSide: boolean, distanceFromGoalLineM: number) {
    const centerX = this.layout.fieldWidthPx / 2;
    const y = this.distanceFromGoalLineToY(isTopSide, distanceFromGoalLineM);

    graphics.circle(centerX, y, SPOT_RADIUS_PX).fill(LINE_STYLE.color);
  }

  private drawCornerArcs(graphics: Graphics, radiusM: number) {
    const { fieldWidthPx, fieldHeightPx } = this.layout;
    const corners: [number, number][] = [
      [0, 0],
      [fieldWidthPx, 0],
      [fieldWidthPx, fieldHeightPx],
      [0, fieldHeightPx],
    ];

    corners.forEach(([x, y], i) => {
      const startAngle = (i * Math.PI) / 2;
      const endAngle = startAngle + Math.PI / 2;
      this.drawArc(graphics, x, y, this.metersToPx(radiusM), startAngle, endAngle);
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

  private distanceFromGoalLineToY(isTopSide: boolean, distanceM: number): number {
    const yM = isTopSide ? distanceM : this.layout.fieldLengthM - distanceM;
    return this.metersToPx(yM);
  }

  private metersToPx(meters: number): number {
    return meters * this.layout.pxPerMeter;
  }
}
