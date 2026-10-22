import { PLAYER_COUNT } from '../const/BoardCONST';
import { FORMATIONS } from '../const/FormationCONST';
import { MAX_PRESET_COUNT } from '../const/PresetCONST';
import { ACTIVE_PRESET_KEY, COORDINATE_PRECISION, HEX_COLOR_PATTERN, PRESET_KEY_PREFIX } from '../const/StorageCONST';
import type { BoardState } from './types';

/** Saves presets to localStorage (one key per slot) and reads/writes share-link hashes. */
export class BoardStorage {
  /** Every valid saved preset, keyed by slot number. */
  loadPresets(): Map<number, BoardState> {
    const presets = new Map<number, BoardState>();
    for (let slot = 1; slot <= MAX_PRESET_COUNT; slot++) {
      const state = this.tryRead(() => JSON.parse(this.getItem(PRESET_KEY_PREFIX + slot) ?? 'null'));
      if (state) presets.set(slot, state);
    }
    return presets;
  }

  savePreset(slot: number, state: BoardState) {
    this.setItem(PRESET_KEY_PREFIX + slot, this.serialize(state));
  }

  removePreset(slot: number) {
    try {
      localStorage.removeItem(PRESET_KEY_PREFIX + slot);
    } catch {}
  }

  loadActiveSlot(): number {
    return Number(this.getItem(ACTIVE_PRESET_KEY));
  }

  saveActiveSlot(slot: number) {
    this.setItem(ACTIVE_PRESET_KEY, String(slot));
  }

  /** The board in the current URL's share-link hash, if any. */
  readSharedLink(): BoardState | null {
    const hash = location.hash.slice(1);
    return hash ? this.tryRead(() => this.decode(hash)) : null;
  }

  clearSharedLink() {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  /** UTF-8 safe, URL safe base64 of the state. */
  encode(state: BoardState): string {
    const bytes = new TextEncoder().encode(this.serialize(state));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private decode(hash: string): unknown {
    const bytes = Uint8Array.from(atob(hash.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // Coordinates are rounded to keep share links short.
  private serialize(state: BoardState): string {
    return JSON.stringify(state, (_, v) =>
      typeof v === 'number' ? Math.round(v * COORDINATE_PRECISION) / COORDINATE_PRECISION : v,
    );
  }

  private tryRead(read: () => unknown): BoardState | null {
    try {
      const state = read();
      return isValidState(state) ? state : null;
    } catch {
      return null;
    }
  }

  private getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}

function isValidState(s: any): s is BoardState {
  const isColor = (c: unknown) => typeof c === 'string' && HEX_COLOR_PATTERN.test(c);
  return (
    s && typeof s.name === 'string' && s.formation in FORMATIONS && isColor(s.color) && isColor(s.gkColor) &&
    Array.isArray(s.players) && s.players.length === PLAYER_COUNT &&
    s.players.every((p: any) => typeof p.name === 'string' && Number.isFinite(p.x) && Number.isFinite(p.y))
  );
}
