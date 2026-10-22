import { MAX_PRESET_COUNT } from '../const/PresetCONST';
import { ACTIVE_PRESET_KEY, COORDINATE_PRECISION, HEX_COLOR_PATTERN, PRESET_KEY_PREFIX } from '../const/StorageCONST';
import { getTeamSize, isFormationName } from './formations';
import type { BoardState } from './types';

export class BoardStorage {
  loadPresets(): Map<number, BoardState> {
    const presets = new Map<number, BoardState>();

    for (let slot = 1; slot <= MAX_PRESET_COUNT; slot++) {
      const state = parseValidState(() => {
        const json = readLocalStorage(getPresetKey(slot)) ?? 'null';
        return JSON.parse(json);
      });

      if (state) {
        presets.set(slot, state);
      }
    }

    return presets;
  }

  savePreset(slot: number, state: BoardState) {
    writeLocalStorage(getPresetKey(slot), serializeState(state));
  }

  removePreset(slot: number) {
    removeLocalStorage(getPresetKey(slot));
  }

  loadActiveSlot(): number {
    return Number(readLocalStorage(ACTIVE_PRESET_KEY));
  }

  saveActiveSlot(slot: number) {
    writeLocalStorage(ACTIVE_PRESET_KEY, String(slot));
  }

  readSharedStateFromUrl(): BoardState | null {
    const hash = location.hash.slice(1);
    if (!hash) {
      return null;
    }

    return parseValidState(() => decodeShareHash(hash));
  }

  clearSharedStateFromUrl() {
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  encodeShareHash(state: BoardState): string {
    const json = serializeState(state);
    const bytes = new TextEncoder().encode(json);
    const base64 = btoa(String.fromCharCode(...bytes));

    return toBase64Url(base64);
  }
}

function decodeShareHash(hash: string): unknown {
  const binary = atob(fromBase64Url(hash));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(base64Url: string): string {
  return base64Url.replace(/-/g, '+').replace(/_/g, '/');
}

function serializeState(state: BoardState): string {
  return JSON.stringify(state, (_, value) => {
    if (typeof value === 'number') {
      return roundCoordinate(value);
    }
    return value;
  });
}

function roundCoordinate(value: number): number {
  return Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;
}

function parseValidState(parse: () => unknown): BoardState | null {
  try {
    const state = parse();
    return isBoardState(state) ? state : null;
  } catch {
    return null;
  }
}

function isBoardState(value: any): value is BoardState {
  if (!value || !isFormationName(value.formation)) {
    return false;
  }

  const hasValidInfo =
    typeof value.name === 'string' &&
    isHexColor(value.color) &&
    isHexColor(value.gkColor);

  const hasValidPlayers =
    Array.isArray(value.players) &&
    value.players.length === getTeamSize(value.formation) &&
    value.players.every(isPlayer);

  return hasValidInfo && hasValidPlayers;
}

function isPlayer(value: any): boolean {
  return typeof value.name === 'string' && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function isHexColor(value: unknown): boolean {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value);
}

function getPresetKey(slot: number): string {
  return PRESET_KEY_PREFIX + slot;
}

function readLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function removeLocalStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
