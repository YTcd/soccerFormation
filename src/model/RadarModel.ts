import {
  DEFAULT_RADAR_PLAYER_NAME_PREFIX,
  DEFAULT_STAT,
  MAX_RADAR_PLAYER_COUNT,
  MAX_STAT,
  MIN_STAT,
  STAT_LABELS,
} from '../const/RadarCONST';
import { RadarStorage } from './RadarStorage';
import type { FormationImportResult, RadarPlayer, RadarPlayerSummary } from './types';

export class RadarModel {
  private readonly players: RadarPlayer[];
  private currentIndex: number;

  constructor(private readonly storage = new RadarStorage()) {
    this.players = storage.loadPlayers();

    if (this.players.length === 0) {
      this.players.push(createPlayer(getDefaultPlayerName(1)));
      storage.savePlayers(this.players);
    }

    const savedIndex = storage.loadActiveIndex();
    this.currentIndex = this.players[savedIndex] ? savedIndex : 0;
  }

  get player(): Readonly<RadarPlayer> {
    return this.activePlayer;
  }

  get playerList(): RadarPlayerSummary[] {
    return this.players.map((player) => ({ name: player.name, total: sumStats(player.stats) }));
  }

  get activeIndex(): number {
    return this.currentIndex;
  }

  get total(): number {
    return sumStats(this.activePlayer.stats);
  }

  get canAddPlayer(): boolean {
    return this.players.length < MAX_RADAR_PLAYER_COUNT;
  }

  get canDeletePlayer(): boolean {
    return this.players.length > 1;
  }

  selectPlayer(index: number) {
    if (!this.players[index]) {
      return;
    }

    this.currentIndex = index;
    this.storage.saveActiveIndex(index);
  }

  addPlayer() {
    if (!this.canAddPlayer) {
      return;
    }

    this.players.push(createPlayer(getDefaultPlayerName(this.players.length + 1)));
    this.storage.savePlayers(this.players);
    this.selectPlayer(this.players.length - 1);
  }

  // Adds names from the Formation page's current preset, skipping blanks and names already in the list.
  importFormationNames(): FormationImportResult | null {
    const preset = this.storage.loadFormationPreset();
    if (!preset) {
      return null;
    }

    const existingNames = new Set(this.players.map((player) => player.name));
    const result = { presetName: preset.name, added: 0, skipped: 0 };

    for (const player of preset.players) {
      const name = player.name.trim();
      if (!name || existingNames.has(name)) {
        continue;
      }

      if (!this.canAddPlayer) {
        result.skipped++;
        continue;
      }

      this.players.push(createPlayer(name));
      existingNames.add(name);
      result.added++;
    }

    this.storage.savePlayers(this.players);
    return result;
  }

  deletePlayer() {
    if (!this.canDeletePlayer) {
      return;
    }

    this.players.splice(this.currentIndex, 1);
    this.storage.savePlayers(this.players);
    this.selectPlayer(Math.max(0, this.currentIndex - 1));
  }

  renamePlayer(name: string) {
    this.activePlayer.name = name;
    this.storage.savePlayers(this.players);
  }

  setStat(statIndex: number, value: number) {
    this.activePlayer.stats[statIndex] = Math.min(MAX_STAT, Math.max(MIN_STAT, Math.round(value)));
    this.storage.savePlayers(this.players);
  }

  createExportJson(): string {
    const players = this.players.map((player) => ({
      name: player.name,
      stats: Object.fromEntries(STAT_LABELS.map((label, i) => [label, player.stats[i]])),
      total: sumStats(player.stats),
    }));

    return JSON.stringify(players, null, 2);
  }

  private get activePlayer(): RadarPlayer {
    return this.players[this.currentIndex];
  }
}

function createPlayer(name: string): RadarPlayer {
  return { name, stats: STAT_LABELS.map(() => DEFAULT_STAT) };
}

function getDefaultPlayerName(number: number): string {
  return `${DEFAULT_RADAR_PLAYER_NAME_PREFIX}${number}`;
}

function sumStats(stats: number[]): number {
  return stats.reduce((sum, stat) => sum + stat, 0);
}
