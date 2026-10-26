import { BASE_PRESET_SLOT } from '../const/PresetCONST';
import { MAX_RADAR_PLAYER_COUNT, MAX_STAT, MIN_STAT, STAT_LABELS } from '../const/RadarCONST';
import { RADAR_ACTIVE_PLAYER_KEY, RADAR_PLAYERS_KEY } from '../const/StorageCONST';
import { BoardStorage } from './BoardStorage';
import type { BoardState, RadarPlayer } from './types';

export class RadarStorage {
  // Reads the preset currently open on the Formation page, falling back to the base preset like BoardModel does.
  loadFormationPreset(): BoardState | null {
    const boardStorage = new BoardStorage();
    const presets = boardStorage.loadPresets();

    return presets.get(boardStorage.loadActiveSlot()) ?? presets.get(BASE_PRESET_SLOT) ?? null;
  }

  loadPlayers(): RadarPlayer[] {
    try {
      const players = JSON.parse(localStorage.getItem(RADAR_PLAYERS_KEY) ?? '[]');
      return Array.isArray(players) ? players.filter(isRadarPlayer).slice(0, MAX_RADAR_PLAYER_COUNT) : [];
    } catch {
      return [];
    }
  }

  savePlayers(players: RadarPlayer[]) {
    try {
      localStorage.setItem(RADAR_PLAYERS_KEY, JSON.stringify(players));
    } catch {}
  }

  loadActiveIndex(): number {
    try {
      return Number(localStorage.getItem(RADAR_ACTIVE_PLAYER_KEY));
    } catch {
      return 0;
    }
  }

  saveActiveIndex(index: number) {
    try {
      localStorage.setItem(RADAR_ACTIVE_PLAYER_KEY, String(index));
    } catch {}
  }
}

function isRadarPlayer(value: any): value is RadarPlayer {
  return (
    typeof value?.name === 'string' &&
    Array.isArray(value.stats) &&
    value.stats.length === STAT_LABELS.length &&
    value.stats.every(isStatValue)
  );
}

function isStatValue(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) >= MIN_STAT && (value as number) <= MAX_STAT;
}
