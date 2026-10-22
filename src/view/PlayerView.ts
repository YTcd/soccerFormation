import { Container, Graphics, Rectangle, Text } from 'pixi.js';
import { PLAYER_BOTTOM, PLAYER_HALF_WIDTH, PLAYER_TOP } from '../const/PlayerCONST';

const COLLAR_X = 10;
const COLLAR_Y = -30;
const JERSEY_OUTLINE = [
  [24, -27], [38, -12], [29, -3], [22, -10],
  [22, 30], [-22, 30],
  [-22, -10], [-29, -3], [-38, -12], [-24, -27],
] as const;

const NAME_FONT_FAMILY = ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'sans-serif'];
const NAME_MAX_WIDTH = 40;

const LIGHT_JERSEY_BRIGHTNESS = 160;
const DARK_TEXT_COLOR = '#111111';
const LIGHT_TEXT_COLOR = '#ffffff';

export class PlayerView extends Container {
  private readonly jersey = new Graphics();
  private readonly nameText = new Text({
    text: '',
    style: {
      fontFamily: NAME_FONT_FAMILY,
      fontSize: 14,
      fontWeight: '700',
      fill: LIGHT_TEXT_COLOR,
    },
  });

  constructor(readonly index: number) {
    super();

    const shadow = new Graphics().ellipse(0, 33, 26, 5).fill({ color: 0x000000, alpha: 0.25 });

    this.nameText.anchor.set(0.5);
    this.nameText.y = 6;

    this.addChild(shadow, this.jersey, this.nameText);

    this.hitArea = new Rectangle(-PLAYER_HALF_WIDTH, -PLAYER_TOP, PLAYER_HALF_WIDTH * 2, PLAYER_TOP + PLAYER_BOTTOM);
    this.eventMode = 'static';
    this.cursor = 'grab';
  }

  updateAppearance(name: string, jerseyColor: string) {
    const textColor = getContrastTextColor(jerseyColor);

    this.drawJersey(jerseyColor, textColor);

    this.nameText.text = name;
    this.nameText.style.fill = textColor;
    this.shrinkNameToMaxWidth();
  }

  private shrinkNameToMaxWidth() {
    this.nameText.scale.set(1);

    const textWidth = this.nameText.width || 1;
    const scale = Math.min(1, NAME_MAX_WIDTH / textWidth);
    this.nameText.scale.set(scale);
  }

  private drawJersey(jerseyColor: string, trimColor: string) {
    const graphics = this.jersey.clear();

    graphics.moveTo(-COLLAR_X, COLLAR_Y).quadraticCurveTo(0, -20, COLLAR_X, COLLAR_Y);

    for (const [x, y] of JERSEY_OUTLINE) {
      graphics.lineTo(x, y);
    }

    graphics
      .closePath()
      .fill(jerseyColor)
      .stroke({ width: 2, color: 0x000000, alpha: 0.35, join: 'round' });

    graphics
      .moveTo(-COLLAR_X, COLLAR_Y)
      .quadraticCurveTo(0, -18, COLLAR_X, COLLAR_Y)
      .stroke({ width: 3, color: trimColor, alpha: 0.5 });
  }
}

function getContrastTextColor(hexColor: string): string {
  const rgb = parseInt(hexColor.slice(1), 16);
  const red = rgb >> 16;
  const green = (rgb >> 8) & 255;
  const blue = rgb & 255;

  const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
  return brightness > LIGHT_JERSEY_BRIGHTNESS ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR;
}
