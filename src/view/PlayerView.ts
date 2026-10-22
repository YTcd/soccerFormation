import { Container, Graphics, Rectangle, Text } from 'pixi.js';
import {
  DARK_TEXT_COLOR,
  JERSEY_BORDER_ALPHA,
  JERSEY_BORDER_COLOR,
  JERSEY_BORDER_WIDTH,
  JERSEY_COLLAR_DIP_Y,
  JERSEY_COLLAR_X,
  JERSEY_COLLAR_Y,
  JERSEY_OUTLINE,
  JERSEY_TRIM_ALPHA,
  JERSEY_TRIM_DIP_Y,
  JERSEY_TRIM_WIDTH,
  LIGHT_JERSEY_BRIGHTNESS,
  LIGHT_TEXT_COLOR,
  NAME_FONT_FAMILY,
  NAME_FONT_SIZE,
  NAME_FONT_WEIGHT,
  NAME_MAX_WIDTH,
  NAME_OFFSET_Y,
  PLAYER_BOTTOM,
  PLAYER_HALF_WIDTH,
  PLAYER_TOP,
  SHADOW_ALPHA,
  SHADOW_COLOR,
  SHADOW_RADIUS_X,
  SHADOW_RADIUS_Y,
  SHADOW_Y,
} from '../const/PlayerCONST';

export class PlayerView extends Container {
  private readonly jersey = new Graphics();
  private readonly nameText = new Text({
    text: '',
    style: { fontFamily: NAME_FONT_FAMILY, fontSize: NAME_FONT_SIZE, fontWeight: NAME_FONT_WEIGHT, fill: LIGHT_TEXT_COLOR },
  });

  constructor(readonly index: number) {
    super();
    const shadow = new Graphics()
      .ellipse(0, SHADOW_Y, SHADOW_RADIUS_X, SHADOW_RADIUS_Y)
      .fill({ color: SHADOW_COLOR, alpha: SHADOW_ALPHA });
    this.nameText.anchor.set(0.5);
    this.nameText.y = NAME_OFFSET_Y;
    this.addChild(shadow, this.jersey, this.nameText);
    this.hitArea = new Rectangle(-PLAYER_HALF_WIDTH, -PLAYER_TOP, PLAYER_HALF_WIDTH * 2, PLAYER_TOP + PLAYER_BOTTOM);
    this.eventMode = 'static';
    this.cursor = 'grab';
  }

  update(name: string, color: string) {
    const textColor = contrastTextColor(color);
    this.drawJersey(color, textColor);
    this.nameText.text = name;
    this.nameText.style.fill = textColor;
    this.nameText.scale.set(1);
    this.nameText.scale.set(Math.min(1, NAME_MAX_WIDTH / (this.nameText.width || 1)));
  }

  private drawJersey(color: string, trimColor: string) {
    const g = this.jersey.clear();
    g.moveTo(-JERSEY_COLLAR_X, JERSEY_COLLAR_Y).quadraticCurveTo(0, JERSEY_COLLAR_DIP_Y, JERSEY_COLLAR_X, JERSEY_COLLAR_Y);
    for (const [x, y] of JERSEY_OUTLINE) g.lineTo(x, y);
    g.closePath()
      .fill(color)
      .stroke({ width: JERSEY_BORDER_WIDTH, color: JERSEY_BORDER_COLOR, alpha: JERSEY_BORDER_ALPHA, join: 'round' });

    g.moveTo(-JERSEY_COLLAR_X, JERSEY_COLLAR_Y)
      .quadraticCurveTo(0, JERSEY_TRIM_DIP_Y, JERSEY_COLLAR_X, JERSEY_COLLAR_Y)
      .stroke({ width: JERSEY_TRIM_WIDTH, color: trimColor, alpha: JERSEY_TRIM_ALPHA });
  }
}

function contrastTextColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const brightness = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return brightness > LIGHT_JERSEY_BRIGHTNESS ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR;
}
