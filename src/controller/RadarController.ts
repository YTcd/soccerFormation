import {
  EXPORT_COPIED_MESSAGE,
  EXPORT_COPY_FALLBACK_MESSAGE,
  EXPORT_FILE_NAME,
  EXPORT_SAVED_MESSAGE,
  IMPORT_NO_PRESET_MESSAGE,
  IMPORT_NOTHING_MESSAGE,
  MAX_RADAR_PLAYER_COUNT,
} from '../const/RadarCONST';
import type { RadarModel } from '../model/RadarModel';
import type { FormationImportResult } from '../model/types';
import type { RadarChartView } from '../view/RadarChartView';
import type { RadarPanelView } from '../view/RadarPanelView';

export class RadarController {
  constructor(
    private readonly model: RadarModel,
    private readonly chart: RadarChartView,
    private readonly panel: RadarPanelView,
  ) {}

  start() {
    const model = this.model;

    this.chart.setHandlers({
      onStatChange: (statIndex, value) => this.changeAndRefresh(() => model.setStat(statIndex, value)),
    });

    this.panel.setHandlers({
      onPlayerSelect: (index) => this.changeAndRefresh(() => model.selectPlayer(index)),
      onPlayerAdd: () => this.changeAndRefresh(() => model.addPlayer()),
      onPlayerRename: (name) => this.changeAndRefresh(() => model.renamePlayer(name)),
      onPlayerDelete: () => this.changeAndRefresh(() => model.deletePlayer()),
      onFormationImport: () => this.importFormationNames(),
      onExportFile: () => this.downloadExportFile(),
      onExportCopy: () => this.copyExportJson(),
    });

    this.refreshViews();
  }

  private changeAndRefresh(change: () => void) {
    change();
    this.refreshViews();
  }

  private refreshViews() {
    const model = this.model;

    this.panel.render({
      players: model.playerList,
      activeIndex: model.activeIndex,
      total: model.total,
      canAddPlayer: model.canAddPlayer,
      canDeletePlayer: model.canDeletePlayer,
    });

    this.chart.render(model.player.stats);
  }

  private importFormationNames() {
    const result = this.model.importFormationNames();

    this.refreshViews();
    this.panel.showToast(getImportMessage(result));
  }

  private downloadExportFile() {
    const blob = new Blob([this.model.createExportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = EXPORT_FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);

    this.panel.showToast(EXPORT_SAVED_MESSAGE);
  }

  private async copyExportJson() {
    const json = this.model.createExportJson();

    try {
      await navigator.clipboard.writeText(json);
      this.panel.showToast(EXPORT_COPIED_MESSAGE);
    } catch {
      prompt(EXPORT_COPY_FALLBACK_MESSAGE, json);
    }
  }
}

function getImportMessage(result: FormationImportResult | null): string {
  if (!result) {
    return IMPORT_NO_PRESET_MESSAGE;
  }

  if (result.added === 0 && result.skipped === 0) {
    return IMPORT_NOTHING_MESSAGE;
  }

  const message = `'${result.presetName}'에서 ${result.added}명을 불러왔어요.`;
  return result.skipped ? `${message} (최대 ${MAX_RADAR_PLAYER_COUNT}명이라 ${result.skipped}명 제외)` : message;
}
