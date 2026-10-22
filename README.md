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

```
index.html          화면 구조
src/main.ts         경기장/선수 렌더링, 드래그, 저장·공유
src/style.css       스타일
vite.config.ts      Vite 설정
.github/workflows/  GitHub Pages 자동 배포
```

## GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드해서 배포합니다.

1. 이 폴더를 GitHub 저장소에 push
2. 저장소 **Settings → Pages → Build and deployment → Source** 를 `GitHub Actions` 로 설정
3. **Actions** 탭에서 배포가 끝나면 `https://<사용자명>.github.io/<저장소명>/` 에서 확인
