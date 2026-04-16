# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 개발 서버 (App.vue 데모, MSW mock API 포함)
npm run dev

# 라이브러리 배포 빌드 (dist/wz-grid.es.js, wz-grid.cjs.js, wz-grid.css, index.d.ts)
npm run build:lib

# VitePress 문서 개발 서버
npm run docs:dev

# VitePress 문서 빌드
npm run docs:build

# 테스트 (Vitest + jsdom; tests/composables/*.spec.ts)
npm run test           # 1회 실행
npm run test:watch     # watch 모드
npm run test:coverage  # v8 커버리지

# 타입 체크
npm run typecheck      # tsc --noEmit
```

테스트는 Vitest로 `tests/composables/*.spec.ts`에서 컴포저블 단위 테스트를 수행한다. 타입 체크는 `npm run typecheck` 또는 `npx tsc --noEmit`으로 실행하되, `.vue` 파일 모듈 선언 누락 오류(TS2307)와 `import.meta.env` 오류(TS2339)는 기존부터 있는 구조적 문제이므로 무시한다.

## 아키텍처

### 이중 빌드 구조

- **데모 앱**: `src/main.ts` → `src/App.vue`. Vite 기본 설정(`vite.config.ts`)으로 빌드. MSW(`src/mocks/`)로 `/api/employees` REST API를 브라우저에서 모킹.
- **라이브러리**: `src/index.ts` 진입점. `vite.lib.config.ts`로 빌드. `vue`, `vue-demi`, `@vue/composition-api`, `exceljs`를 external로 처리. Vue 2/3 동시 지원을 위해 모든 import는 `vue` 대신 `vue-demi`를 사용.

### WZGrid.vue 내부 데이터 흐름

```
props.rows
  → sortedRows         (useSort: serverSide=false일 때 클라이언트 사이드 자동 정렬)
  → treeAllFlat        (useTree 모드: 트리 전체 노드 평탄화, 필터 입력용)
  → filteredRows       (useFilter: 컬럼별 AND 필터)
  ↓
  [useTree 모드]  flatTreeItems  (useTree: 접기/펼치기 상태 반영)
  [일반 모드]     flatGroupedItems (useGrouping: 그룹헤더 + 데이터 + 소계)
  ↓
  activeItems          (두 경로 통합 computed)
  → pagedItems         (usePaging: 현재 페이지 슬라이스)
  → visibleRowsRange   (useVirtualScroll: 셀 병합 활성 시 전체 렌더링)
```

### eff computed (prop alias 레이어)

`WZGrid.vue` setup() 내부에서 `eff` 접두어 computed를 사용한다:
- `effShowColumnSettings`, `effUseContextMenu`, `effUseRowDrag`, `effGroupBy`, `effAutoMergeCols`, `effMergeCells`, `effUseAdvancedFilter`, `effServerSide`, `effUseDetail`, `effShowExcelExport`
- 라이선스 시스템 제거(오픈소스 전환) 이후 `eff` computed는 prop alias 역할만 수행 (Pro 게이팅 없음)
- 템플릿에서 props 직접 참조 대신 이 `eff` computed를 사용해야 한다 (shadowing 방지)
- Prop alias: `useColumnSettings`(←showColumnSettings), `useExcelExport`(←showExcelExport), `useServerSide`(←serverSide) — 기존 이름도 하위 호환 유지

### 컴포넌트 구조

| 컴포넌트 | 역할 |
|:---------|:-----|
| `WZGrid.vue` | 메인 컨테이너. setup()에서 모든 컴포저블 초기화, 데이터 흐름 관리, 그룹헤더/소계/디테일/푸터/페이징/컨텍스트메뉴 렌더링 |
| `WZGridToolbar.vue` | 상단 툴바: 추가/삭제 버튼, 엑셀 내보내기, 컬럼 설정. `#toolbar` 슬롯 포워딩 |
| `WZGridHeader.vue` | `<thead>` 영역: 컬럼 헤더, 정렬 표시, 리사이즈 핸들, 필터 행 |
| `WZGridRow.vue` | 단일 데이터 행 렌더링: 셀, 편집 모드, 체크박스, 드래그 핸들. `parentSlots` prop으로 `cell-*` 동적 슬롯 포워딩 |

### 컴포저블 역할

| 파일 | 역할 |
|:-----|:-----|
| `useSort` | `sortedRows` computed 제공. serverSide=false일 때 숫자/날짜/문자열 자동 감지 정렬. serverSide=true일 때 원본 반환 |
| `useVirtualScroll` | 스크롤 위치 기반 렌더 범위 계산. getter 함수로 rowHeight/viewportHeight를 받아 동적 반응. 셀 병합 활성 시 우회됨 |
| `useFilter` | filters Map 관리. `treeAllFlat`을 입력으로 받아 tree/일반 모드 통합 |
| `useGrouping` | `useTree` 활성 시 빈 배열/빈 키를 전달받아 자동으로 no-op |
| `useTree` | `collapsedIds Set` 관리. `getFilteredIds`가 null이면 필터 없음, Set이면 일치 노드 + 조상만 표시 |
| `useMerge` | `getAutoMergeCols`, `getMergeCellsFn` 기반으로 `MergeState` 맵 생성. `hasActiveMerge`가 true면 가상 스크롤 비활성화 |
| `useSelection` | `{ startRow, startCol, endRow, endCol }` 범위. 클립보드와 연동 |
| `useColumnDrag` | 리사이즈 중(`getIsResizing()`) drag 차단 로직 포함 |

### 셀 병합 주의사항

`autoMergeCols` 또는 `mergeCells`가 활성화되면 `hasActiveMerge`가 true가 되어 가상 스크롤이 비활성화되고 전체 행을 렌더링한다. 대량 데이터와 함께 사용 시 성능 저하가 발생할 수 있다.

### 문서 (`docs/`)

VitePress 기반. `docs/.vitepress/config.ts`에서 사이드바 구성.
**DOCS.md도 코드 변경 시 함께 업데이트해야 한다** — props 추가/변경, 라이선스 티어 변경, 새 기능 추가 시 항상 반영.

## 작업 완료 체크리스트

모든 코드 변경 작업이 끝나면 반드시 아래 순서를 따른다.

1. **문서 업데이트** — 변경된 기능에 해당하는 문서를 모두 반영한다.
   - `DOCS.md` — props·이벤트·동작 방식 변경 시 해당 섹션 수정, 최종 업데이트 날짜 갱신
   - `docs/guide/` — 관련 가이드 파일 수정 (기능 추가 시 새 파일 생성 + `docs/.vitepress/config.ts` 사이드바 등록)
   - `docs/api/` — Column 타입·Props 변경 시 수정

2. **커밋** — 변경된 소스와 문서를 함께 커밋한다.
   ```bash
   git add <변경된 파일들>
   git commit -m "..."
   ```

3. **Push**
   ```bash
   git push
   ```

### 컬럼 타입별 편집 가능 여부

편집 가능(`text`, `number`, `date`, `datetime`, `select`, `currency`, `email`, `textarea`), 클릭 즉시 반영(`boolean`, `radio`, `rating`, `color`), 편집 불가(`badge`, `progress`, `image`, `button`, `link`, `tag`, `sparkline`).
