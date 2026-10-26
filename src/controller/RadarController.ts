import {
  EXPORT_COPIED_MESSAGE,
  EXPORT_COPY_FALLBACK_MESSAGE,
  EXPORT_FILE_NAME,
  EXPORT_SAVED_MESSAGE,
} from '../const/RadarCONST';
import type { RadarModel } from '../model/RadarModel';
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
