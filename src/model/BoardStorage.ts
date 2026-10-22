import { PLAYER_COUNT } from '../const/BoardCONST';
import { FORMATIONS } from '../const/FormationCONST';
import { COORDINATE_PRECISION, HEX_COLOR_PATTERN, STORAGE_KEY } from '../const/StorageCONST';
import type { BoardState } from './types';

/** Persists board state to localStorage and encodes it into share-link hashes. */
export class BoardStorage {
  /** Loads from the share-link hash first (then clears it), falling back to localStorage. */
  load(): BoardState | null {
    const hash = location.hash.slice(1);
    if (hash) {
      history.replaceState(null, '', location.pathname + location.search);
      const shared = this.tryRead(() => this.decode(hash));
      if (shared) return shared;
    }
    return this.tryRead(() => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'));
  }

  save(state: BoardState) {
    try {
      localStorage.setItem(STORAGE_KEY, this.serialize(state));
    } catch {}
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
}

function isValidState(s: any): s is BoardState {
  const isColor = (c: unknown) => typeof c === 'string' && HEX_COLOR_PATTERN.test(c);
  return (
    s && s.formation in FORMATIONS && isColor(s.color) && isColor(s.gkColor) &&
    Array.isArray(s.players) && s.players.length === PLAYER_COUNT &&
    s.players.every((p: any) => typeof p.name === 'string' && Number.isFinite(p.x) && Number.isFinite(p.y))
  );
}
