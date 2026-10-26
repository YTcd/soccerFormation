import './style.css';
import { RadarController } from './controller/RadarController';
import { RadarModel } from './model/RadarModel';
import { RadarChartView } from './view/RadarChartView';
import { RadarPanelView } from './view/RadarPanelView';

const model = new RadarModel();
const chart = new RadarChartView(document.getElementById('chart')!);
const panel = new RadarPanelView();

new RadarController(model, chart, panel).start();
