# 축구 전술판

pixi.js + TypeScript로 만든 축구 전술판 / 포메이션 공유 페이지입니다. Vite로 빌드합니다.

- 유니폼을 드래그해서 선수 위치 이동
- 포메이션 프리셋, 유니폼 색상(필드/골키퍼), 선수 이름 편집
- 변경 사항은 브라우저(localStorage)에 자동 저장
- **링크 복사**: 현재 상태가 URL에 담겨 그대로 공유됨
- **이미지 저장**: PNG로 다운로드

## 개발

Node.js 18 이상이 필요합니다.

```sh
npm install
npm run dev      # watch 모드: http://localhost:8000 이 열리고, 파일 저장 시 자동 반영
npm run build    # 타입 체크(tsc) 후 dist/ 에 빌드
npm run preview  # 빌드 결과(dist/) 확인
```

## 구조

MVC 패턴으로 나뉘어 있습니다.

```
src/
├─ main.ts                    진입점: Model·View·Controller 생성과 연결
├─ const/                     변하지 않는 값 모음 (모두 대문자 이름)
│  ├─ BoardCONST.ts           선수 수, 기본 포메이션·색상·이름
│  ├─ FormationCONST.ts       포메이션 프리셋, 줄 배치 위치
│  ├─ PitchCONST.ts           FIFA 경기장 규격(m), 잔디·라인 색
│  ├─ LayoutCONST.ts          캔버스 크기, 해상도
│  ├─ PlayerCONST.ts          유니폼 모양, 그림자, 이름 글꼴
│  ├─ StorageCONST.ts         저장 키, 좌표 정밀도
│  └─ UICONST.ts              안내 문구, 입력 제한, 토스트 시간
├─ model/                     데이터와 규칙 (화면을 모름)
│  ├─ types.ts                상태 타입
│  ├─ formations.ts           포메이션 위치 계산
│  ├─ BoardStorage.ts         localStorage 저장, 공유 링크 인코딩
│  └─ BoardModel.ts           상태 보관과 변경 메서드
├─ view/                      화면 (Model을 직접 바꾸지 않음)
│  ├─ PitchView.ts            경기장
│  ├─ PlayerView.ts           선수 유니폼
│  ├─ BoardView.ts            Pixi 캔버스, 드래그, 이미지 저장
│  └─ PanelView.ts            오른쪽 설정 패널
├─ controller/
│  └─ BoardController.ts      View 이벤트 → Model 변경 → View 갱신
└─ style.css
```

## GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드해서 배포합니다.

1. 이 폴더를 GitHub 저장소에 push
2. 저장소 **Settings → Pages → Build and deployment → Source** 를 `GitHub Actions` 로 설정
3. **Actions** 탭에서 배포가 끝나면 `https://<사용자명>.github.io/<저장소명>/` 에서 확인
