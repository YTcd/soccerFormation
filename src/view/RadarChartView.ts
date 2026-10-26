import {
  CHART_HANDLE_RADIUS,
  CHART_HIT_MARGIN,
  CHART_LABEL_OFFSET,
  CHART_MAJOR_GRID_STEP,
  CHART_RADIUS,
  CHART_VIEW_BOX,
  MAX_STAT,
  STAT_LABELS,
} from '../const/RadarCONST';
import type { Position } from '../model/types';

const SVG_NS = 'http://www.w3.org/2000/svg';
const AXIS_ANGLE_STEP = (Math.PI * 2) / STAT_LABELS.length;

export type RadarChartHandlers = {
  onStatChange(statIndex: number, value: number): void;
};

export class RadarChartView {
  private readonly svg = createSvgElement('svg', { viewBox: CHART_VIEW_BOX, class: 'radar-chart' });
  private readonly shape = createSvgElement('polygon', { class: 'radar-shape' });
  private readonly handles: SVGCircleElement[] = [];
  private readonly valueLabels: SVGTSpanElement[] = [];
  private handlers?: RadarChartHandlers;
  private dragStatIndex: number | null = null;

  constructor(container: HTMLElement) {
    this.drawGrid();
    this.svg.append(this.shape);

    STAT_LABELS.forEach((label, i) => {
      const handle = createSvgElement('circle', { class: 'radar-handle', r: CHART_HANDLE_RADIUS });
      this.handles.push(handle);
      this.svg.append(handle);
      this.svg.append(this.createLabel(i, label));
    });

    container.append(this.svg);
    this.bindPointerEvents();
  }

  setHandlers(handlers: RadarChartHandlers) {
    this.handlers = handlers;
  }

  render(stats: readonly number[]) {
    const points = stats.map((stat, i) => getAxisPoint(i, (stat / MAX_STAT) * CHART_RADIUS));
    this.shape.setAttribute('points', toPointsAttribute(points));

    points.forEach((point, i) => {
      this.handles[i].setAttribute('cx', String(point.x));
      this.handles[i].setAttribute('cy', String(point.y));
      this.valueLabels[i].textContent = String(stats[i]);
    });
  }

  private drawGrid() {
    for (let level = 1; level <= MAX_STAT; level++) {
      const radius = (level / MAX_STAT) * CHART_RADIUS;
      const points = STAT_LABELS.map((_, i) => getAxisPoint(i, radius));
      const className = level % CHART_MAJOR_GRID_STEP === 0 ? 'radar-grid major' : 'radar-grid';
      this.svg.append(createSvgElement('polygon', { class: className, points: toPointsAttribute(points) }));
    }

    STAT_LABELS.forEach((_, i) => {
      const end = getAxisPoint(i, CHART_RADIUS);
      this.svg.append(createSvgElement('line', { class: 'radar-axis', x1: 0, y1: 0, x2: end.x, y2: end.y }));
    });
  }

  // Places the label outside the axis end, anchored away from the chart so it never overlaps the grid.
  private createLabel(statIndex: number, label: string): SVGTextElement {
    const position = getAxisPoint(statIndex, CHART_RADIUS + CHART_LABEL_OFFSET);
    const anchor = Math.abs(position.x) < 1 ? 'middle' : position.x > 0 ? 'start' : 'end';

    const text = createSvgElement('text', {
      class: 'radar-label',
      x: position.x,
      y: position.y,
      'text-anchor': anchor,
      'dominant-baseline': 'middle',
    });
    const valueLabel = createSvgElement('tspan', { class: 'value', dx: 6 });

    text.append(label, valueLabel);
    this.valueLabels.push(valueLabel);
    return text;
  }

  // Pointer down picks the nearest axis and locks it; moving projects the pointer onto that axis.
  private bindPointerEvents() {
    this.svg.addEventListener('pointerdown', (event) => {
      const point = this.toChartPoint(event);
      if (Math.hypot(point.x, point.y) > CHART_RADIUS + CHART_HIT_MARGIN) {
        return;
      }

      this.dragStatIndex = findNearestAxis(point);
      this.svg.setPointerCapture(event.pointerId);
      this.updateStat(point);
    });

    this.svg.addEventListener('pointermove', (event) => {
      if (this.dragStatIndex !== null) {
        this.updateStat(this.toChartPoint(event));
      }
    });

    const endDrag = () => {
      this.dragStatIndex = null;
    };
    this.svg.addEventListener('pointerup', endDrag);
    this.svg.addEventListener('pointercancel', endDrag);
  }

  private updateStat(point: Position) {
    const statIndex = this.dragStatIndex!;
    const axis = getAxisPoint(statIndex, 1);
    const distanceOnAxis = point.x * axis.x + point.y * axis.y;

    this.handlers?.onStatChange(statIndex, (distanceOnAxis / CHART_RADIUS) * MAX_STAT);
  }

  private toChartPoint(event: PointerEvent): Position {
    const matrix = this.svg.getScreenCTM()!.inverse();
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
  }
}

// Axis 0 points straight up, the rest follow clockwise.
function getAxisPoint(statIndex: number, radius: number): Position {
  const angle = statIndex * AXIS_ANGLE_STEP - Math.PI / 2;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

function findNearestAxis(point: Position): number {
  const angle = Math.atan2(point.y, point.x) + Math.PI / 2;
  const index = Math.round(angle / AXIS_ANGLE_STEP);
  return ((index % STAT_LABELS.length) + STAT_LABELS.length) % STAT_LABELS.length;
}

function toPointsAttribute(points: Position[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  return element;
}
