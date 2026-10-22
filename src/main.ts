import { Application, Container, FederatedPointerEvent, Graphics, Rectangle, Text } from 'pixi.js';
import './style.css';

const SCALE = 9; // px per meter
const MARGIN = 30;
const FIELD_W = 68 * SCALE;
const FIELD_H = 105 * SCALE;
const W = FIELD_W + MARGIN * 2;
const H = FIELD_H + MARGIN * 2;
const STORAGE_KEY = 'soccer-formation';
const FONT = ['-apple-system', 'BlinkMacSystemFont', 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'sans-serif'];
const NAME_MAX_WIDTH = 40;

// Rows from defense to attack (goalkeeper excluded).
const FORMATIONS = {
  '4-4-2': [4, 4, 2],
  '4-3-3': [4, 3, 3],
  '4-2-3-1': [4, 2, 3, 1],
  '4-1-4-1': [4, 1, 4, 1],
  '3-5-2': [3, 5, 2],
  '3-4-3': [3, 4, 3],
  '5-3-2': [5, 3, 2],
  '5-4-1': [5, 4, 1],
} satisfies Record<string, number[]>;

type FormationName = keyof typeof FORMATIONS;
type Position = { x: number; y: number };
type Player = Position & { name: string };
type BoardState = { formation: FormationName; color: string; gkColor: string; players: Player[] };
type PlayerView = { c: Container; body: Graphics; label: Text };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round3 = (v: number) => Math.round(v * 1000) / 1000;

/** Normalized (0..1) field positions for a formation; our goal is at the bottom. */
function formationPositions(name: FormationName): Position[] {
  const rows: number[] = FORMATIONS[name];
  const positions = [{ x: 0.5, y: 0.93 }];
  rows.forEach((count, r) => {
    const y = 0.78 - (0.38 * r) / (rows.length - 1);
    for (let i = 0; i < count; i++) positions.push({ x: round3(0.08 + (0.84 * (i + 0.5)) / count), y: round3(y) });
  });
  return positions;
}

function defaultState(): BoardState {
  return {
    formation: '4-4-2',
    color: '#d32f2f',
    gkColor: '#fbc02d',
    players: formationPositions('4-4-2').map((p, i) => ({ name: `선수${i + 1}`, ...p })),
  };
}

function isValid(s: any): s is BoardState {
  const isColor = (c: unknown) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
  return (
    s && s.formation in FORMATIONS && isColor(s.color) && isColor(s.gkColor) &&
    Array.isArray(s.players) && s.players.length === 11 &&
    s.players.every((p: any) => typeof p.name === 'string' && Number.isFinite(p.x) && Number.isFinite(p.y))
  );
}

/** UTF-8 safe, URL safe base64 encoding of the state for share links. */
function encodeState(obj: BoardState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeState(str: string): unknown {
  const bytes = Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** Loads state from the share link hash first, then localStorage. */
function loadState(): BoardState {
  if (location.hash.length > 1) {
    const hash = location.hash.slice(1);
    history.replaceState(null, '', location.pathname + location.search);
    try {
      const s = decodeState(hash);
      if (isValid(s)) return s;
    } catch {}
  }
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (isValid(s)) return s;
  } catch {}
  return defaultState();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function textColorFor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luma > 160 ? '#111111' : '#ffffff';
}

/** Grass stripes and FIFA-proportioned pitch markings, drawn in meters. */
function createPitch(): Container {
  const pitch = new Container();
  const grass = new Graphics().rect(0, 0, W, H).fill(0x2e7d32);
  const stripe = FIELD_H / 14;
  for (let i = 0; i < 14; i += 2) grass.rect(0, MARGIN + i * stripe, W, stripe).fill(0x388e3c);

  const s = SCALE;
  const line = { width: 2, color: 0xffffff, alpha: 0.9 };
  const g = new Graphics();
  g.position.set(MARGIN, MARGIN);

  g.rect(0, 0, 68 * s, 105 * s).stroke(line);
  g.moveTo(0, 52.5 * s).lineTo(68 * s, 52.5 * s).stroke(line);
  g.circle(34 * s, 52.5 * s, 9.15 * s).stroke(line);
  g.circle(34 * s, 52.5 * s, 3).fill(0xffffff);

  const arcHalf = Math.acos(5.5 / 9.15);
  for (const top of [true, false]) {
    const y = (d: number) => (top ? d : 105 - d) * s; // d = distance from the goal line
    g.rect((34 - 20.16) * s, Math.min(y(0), y(16.5)), 40.32 * s, 16.5 * s).stroke(line);
    g.rect((34 - 9.16) * s, Math.min(y(0), y(5.5)), 18.32 * s, 5.5 * s).stroke(line);
    g.rect((34 - 3.66) * s, top ? -2 * s : 105 * s, 7.32 * s, 2 * s).stroke(line);
    g.circle(34 * s, y(11), 3).fill(0xffffff);

    const dir = top ? Math.PI / 2 : -Math.PI / 2;
    const r = 9.15 * s;
    g.moveTo(34 * s + r * Math.cos(dir - arcHalf), y(11) + r * Math.sin(dir - arcHalf))
      .arc(34 * s, y(11), r, dir - arcHalf, dir + arcHalf)
      .stroke(line);
  }

  const corners: [number, number, number][] = [[0, 0, 0], [68, 0, 0.5], [68, 105, 1], [0, 105, 1.5]];
  for (const [cx, cy, start] of corners) {
    const a = start * Math.PI;
    g.moveTo(cx * s + s * Math.cos(a), cy * s + s * Math.sin(a))
      .arc(cx * s, cy * s, s, a, a + Math.PI / 2)
      .stroke(line);
  }

  pitch.addChild(grass, g);
  return pitch;
}

/** T-shirt silhouette centered at (0, 0). */
function drawJersey(g: Graphics, color: string, trimColor: string) {
  g.clear()
    .moveTo(-10, -30)
    .quadraticCurveTo(0, -20, 10, -30)
    .lineTo(24, -27)
    .lineTo(38, -12)
    .lineTo(29, -3)
    .lineTo(22, -10)
    .lineTo(22, 30)
    .lineTo(-22, 30)
    .lineTo(-22, -10)
    .lineTo(-29, -3)
    .lineTo(-38, -12)
    .lineTo(-24, -27)
    .closePath()
    .fill(color)
    .stroke({ width: 2, color: 0x000000, alpha: 0.35, join: 'round' });
  g.moveTo(-10, -30).quadraticCurveTo(0, -18, 10, -30).stroke({ width: 3, color: trimColor, alpha: 0.5 });
}

function createPlayerView(index: number): PlayerView {
  const c = new Container();
  const shadow = new Graphics().ellipse(0, 33, 26, 5).fill({ color: 0x000000, alpha: 0.25 });
  const body = new Graphics();
  const label = new Text({ text: '', style: { fontFamily: FONT, fontSize: 14, fontWeight: '700', fill: '#ffffff' } });
  label.anchor.set(0.5);
  label.y = 6;
  c.addChild(shadow, body, label);
  c.hitArea = new Rectangle(-38, -32, 76, 66);
  c.eventMode = 'static';
  c.cursor = 'grab';
  c.on('pointerdown', (e) => startDrag(e, index));
  c.on('pointerup', endDrag);
  c.on('pointerupoutside', endDrag);
  return { c, body, label };
}

function renderPlayer(i: number) {
  const p = state.players[i];
  const v = views[i];
  const color = i === 0 ? state.gkColor : state.color;
  const textColor = textColorFor(color);
  drawJersey(v.body, color, textColor);
  v.label.text = p.name;
  v.label.style.fill = textColor;
  v.label.scale.set(1);
  v.label.scale.set(Math.min(1, NAME_MAX_WIDTH / (v.label.width || 1)));
  v.c.position.set(MARGIN + p.x * FIELD_W, MARGIN + p.y * FIELD_H);
}

function renderAll() {
  state.players.forEach((_, i) => renderPlayer(i));
}

// --- Drag & drop ---
let drag: { i: number; dx: number; dy: number } | null = null;

function startDrag(e: FederatedPointerEvent, i: number) {
  const v = views[i];
  drag = { i, dx: v.c.x - e.global.x, dy: v.c.y - e.global.y };
  playerLayer.addChild(v.c); // bring to front
  v.c.cursor = 'grabbing';
}

function moveDrag(e: FederatedPointerEvent) {
  if (!drag) return;
  const x = clamp(e.global.x + drag.dx, 38, W - 38);
  const y = clamp(e.global.y + drag.dy, 32, H - 38);
  views[drag.i].c.position.set(x, y);
}

function endDrag() {
  if (!drag) return;
  const v = views[drag.i];
  const p = state.players[drag.i];
  p.x = round3((v.c.x - MARGIN) / FIELD_W);
  p.y = round3((v.c.y - MARGIN) / FIELD_H);
  v.c.cursor = 'grab';
  drag = null;
  save();
}

// --- Panel ---
function buildPanel() {
  const formation = $<HTMLSelectElement>('formation');
  for (const name of Object.keys(FORMATIONS)) formation.add(new Option(name, name));
  formation.addEventListener('change', () => {
    state.formation = formation.value as FormationName;
    formationPositions(state.formation).forEach((pos, i) => Object.assign(state.players[i], pos));
    renderAll();
    save();
  });

  for (const key of ['color', 'gkColor'] as const) {
    const input = $<HTMLInputElement>(key);
    input.addEventListener('input', () => {
      state[key] = input.value;
      renderAll();
      save();
    });
  }

  for (let i = 0; i < 11; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 12;
    input.placeholder = i === 0 ? '골키퍼' : `선수 ${i + 1}`;
    input.addEventListener('input', () => {
      state.players[i].name = input.value;
      renderPlayer(i);
      save();
    });
    const li = document.createElement('li');
    li.append(input);
    $('names').append(li);
  }

  $('share').addEventListener('click', copyShareLink);
  $('download').addEventListener('click', downloadImage);
  $('reset').addEventListener('click', () => {
    if (!confirm('모든 선수 위치와 이름을 초기화할까요?')) return;
    state = defaultState();
    syncPanel();
    renderAll();
    save();
  });
}

function syncPanel() {
  $<HTMLSelectElement>('formation').value = state.formation;
  $<HTMLInputElement>('color').value = state.color;
  $<HTMLInputElement>('gkColor').value = state.gkColor;
  $('names').querySelectorAll('input').forEach((input, i) => (input.value = state.players[i].name));
}

let toastTimer: number | undefined;
function toast(message: string) {
  $('toast').textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('toast').textContent = ''), 2500);
}

async function copyShareLink() {
  const url = `${location.origin}${location.pathname}#${encodeState(state)}`;
  try {
    await navigator.clipboard.writeText(url);
    toast('공유 링크를 복사했어요.');
  } catch {
    prompt('아래 링크를 복사하세요.', url);
  }
}

async function downloadImage() {
  const dataUrl = await app.renderer.extract.base64({
    target: app.stage,
    frame: new Rectangle(0, 0, W, H),
    resolution: 2,
    format: 'png',
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `formation-${state.formation}.png`;
  a.click();
  toast('이미지를 저장했어요.');
}

// --- Boot ---
let state = loadState();

const app = new Application();
await app.init({ width: W, height: H, antialias: true, background: '#2e7d32', resolution: Math.max(2, window.devicePixelRatio) });
$('board').append(app.canvas);

const playerLayer = new Container();
const views = state.players.map((_, i) => createPlayerView(i));
playerLayer.addChild(...views.map((v) => v.c));
app.stage.addChild(createPitch(), playerLayer);

app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.on('globalpointermove', moveDrag);
app.stage.on('pointerup', endDrag);

buildPanel();
syncPanel();
renderAll();
save();
