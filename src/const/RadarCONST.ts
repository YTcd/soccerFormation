export const STAT_LABELS = [
  "패스·크로스",
  "속도",
  "슈팅",
  "드리블",
  "수비",
  "체력",
] as const;
export const MIN_STAT = 0;
export const MAX_STAT = 10;
export const DEFAULT_STAT = 5;
export const MAX_TOTAL = MAX_STAT * STAT_LABELS.length;

export const MAX_RADAR_PLAYER_COUNT = 15;
export const DEFAULT_RADAR_PLAYER_NAME_PREFIX = "선수 ";
export const DELETE_RADAR_PLAYER_CONFIRM_MESSAGE = "현재 선수를 삭제할까요?";

export const EXPORT_FILE_NAME = "radar-players.json";
export const EXPORT_SAVED_MESSAGE = "JSON 파일을 저장했어요.";
export const EXPORT_COPIED_MESSAGE = "JSON을 클립보드에 복사했어요.";
export const EXPORT_COPY_FALLBACK_MESSAGE = "아래 JSON을 복사하세요.";

export const CHART_RADIUS = 140;
export const CHART_LABEL_OFFSET = 20;
export const CHART_HIT_MARGIN = 16;
export const CHART_HANDLE_RADIUS = 7;
export const CHART_MAJOR_GRID_STEP = 5;
export const CHART_VIEW_BOX = "-230 -185 460 370";
