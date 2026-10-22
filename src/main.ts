import './style.css';
import { BoardController } from './controller/BoardController';
import { BoardModel } from './model/BoardModel';
import { BoardView } from './view/BoardView';
import { PanelView } from './view/PanelView';

const model = new BoardModel();
const board = await BoardView.create(document.getElementById('board')!);
const panel = new PanelView();

new BoardController(model, board, panel).start();
