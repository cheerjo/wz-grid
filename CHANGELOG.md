# Changelog

모든 주요 변경사항은 이 파일에 기록됩니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며, 이 프로젝트는
[Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 준수합니다.

## [Unreleased]

### Added
- Headless core package `@wezon/wz-grid-core` with framework-agnostic TypeScript engines
- React wrapper package `@wezon/wz-grid-react` (basic features: sort, filter, paging, virtual scroll, checkbox, text edit)
- Monorepo structure with pnpm workspaces

### Changed
- `wz-grid` renamed to `@wezon/wz-grid-vue` (Vue-specific package, scoped to @wezon)
- All Vue components now consume `@wezon/wz-grid-core` for shared logic

### Migration
- Existing Vue users: `npm install @wezon/wz-grid-vue` (replace `wz-grid` import path)
- CSS import: `import '@wezon/wz-grid-vue/dist/wz-grid-vue.css'`
- Public API unchanged — no code changes required beyond the import path

---

## [1.5.0] - 2026-04-17

9개 단계(Phase 1 ~ Phase 4.4)에 걸친 대규모 기능 추가와 안정화 릴리즈입니다.
모든 변경은 **하위 호환**을 유지합니다 — 기존 사용자 코드는 수정 없이 그대로 동작합니다.

### ✨ Added

#### a11y & UX
- 포커스 트랩 composable `useFocusTrap` — Tab/Shift+Tab 순환, Esc 콜백, 해제 시 이전 포커스 복귀
- 컨텍스트 메뉴 a11y — `role="menu"`/`menuitem`/`separator` + `aria-label` + 포커스 트랩
- 키보드 네비게이션 확장 — `Home` / `End` / `Ctrl+Home` / `Ctrl+End` / `PageUp` / `PageDown` (그룹 헤더/소계 자동 스킵)
- `date` / `datetime` 필터 프리셋 — 오늘 / 최근 7일 / 이번 달 (i18n `datePreset.*`)
- `#empty-actions` 슬롯 — 빈 상태에서 CTA 버튼(새로고침·필터 초기화) 렌더
- `aria-sort`, `aria-busy`, `aria-rowcount`, `aria-expanded`, `aria-live` 지원 강화

#### TypeScript 제네릭
- `Column<T>`의 `validator` / `onInput` / `footer` 콜백 시그니처에 제네릭 `T` 전파
  - `validator: (value: ColumnCellValue<T>, row: GridRow<T>) => string | null`
  - `footer: FooterAggr<T>` (함수형 집계의 `rows` 인자가 `GridRow<T>[]`)
- `CellUpdateEvent<T>.value` / `oldValue` → `ColumnCellValue<T>` 타입 강화
- `CellSlotProps<T>.value` → `ColumnCellValue<T>`
- `DataItem<T>` / `GridItem<T>` 제네릭화
- 신규 헬퍼 타입 `ColumnCellValue<T>` export

#### 내보내기
- CSV 안전 내보내기 — `exportCSV` / `toCSV` / `escapeCSVField` 신규
  - **CSV injection 방어** (OWASP 권장 `'` prepend: `=`, `+`, `-`, `@`, `\t`, `\r`)
  - RFC 4180 quoting, UTF-8 BOM 기본 포함
  - `Date` ISO, 객체 JSON 자동 직렬화
  - `Column<T>` / `GridRow<T>` 제네릭 전파, `transformCell` 훅
- 툴바 CSV 버튼 — `useCsvExport` / `csvFilename` / `csvDelimiter` props

#### Undo / Redo
- `useUndoRedo` composable — LIFO undo/redo 스택, 분기 변경 시 redo 비움, `maxDepth` FIFO drain
- WZGrid `useUndo` / `maxUndoDepth` props
- 키 바인딩 — `Ctrl+Z` / `Cmd+Z` (Undo), `Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Shift+Z` (Redo)
- 단방향 데이터 흐름 유지 — `rows`를 직접 mutate하지 않고 `@update:cell`을 역/재 값으로 재 emit
- `@undo` / `@redo` 선택적 이벤트 (HistoryEntry 페이로드)
- `HistoryEntry<T>` 타입 export

#### 병합 + 가상 스크롤 부분 지원
- `useMerge.getMergeSpan(itemIdx)` — 행이 속한 가장 넓은 병합 블록 `[start, end)` 범위 반환
- 여러 컬럼 병합이 겹치면 가장 넓은 쪽으로 자동 확장
- `virtualizeWithMerge: true` prop (opt-in) — 병합 활성 상태에서도 가상 스크롤 유지
- `_vs.visibleRange`를 병합 블록 경계까지 확장 → 블록 절단 없이 viewport 밖 행은 렌더 스킵
- `MergeRowSpan` 타입 export

#### v-model 확장
- `v-model:checkedIds` — 체크된 행 id 배열 양방향 바인딩
- `v-model:filters` — 필터 상태 양방향 바인딩 (제어 모드)
- `v-model:sort` — 정렬 구성 양방향 바인딩
- 개발 모드(`import.meta.env.DEV`) 상호배제 경고 — useTree+groupBy / useServerSide+useTree / 병합+대량 데이터

#### 테스팅 & CI
- **Vitest + jsdom** 테스트 프레임워크 도입 — 8 파일 / **66 테스트**
  - `useSort` (7) / `useFilter` (8) / `useMerge` (10) / `useTree` (6) / `useGrouping` (4)
  - `useFocusTrap` (4) / `useUndoRedo` (8)
  - `csv` (19)
  - 타입 레벨 회귀 `tests/types/column-generics.ts`
- npm scripts — `test`, `test:watch`, `test:coverage`, `typecheck`
- GitHub Actions CI — `.github/workflows/ci.yml` (typecheck → test → build:lib, Node 20, dist artifact)

#### Phase 1 안정화
- 서버사이드 필터 debounce + IME(한글) 조합 보호, `filterDebounceMs` prop
- `loading` / `loadingRowCount` / `emptyText` prop, `#loading` / `#empty` 슬롯
- 체크박스·드래그·디테일·트리 토글 `aria-label` / `role` 보강
- 컨텍스트 메뉴 좌표 음수 방지 클램프
- `useMerge` 병합 범위 경계 클램프
- `SortChangeEvent` / `FilterChangeEvent` / `SelectionChangeEvent` / `PagingChangeEvent` / `CheckedChangeEvent` / `CellSlotProps` / `DetailSlotProps` 타입 export

### 🔧 Changed

- `CellUpdateEvent<T>` payload에 `rowIdx` / `colKey` / `oldValue` 공식화
  - 기존 `key` 필드는 `colKey`와 동일한 값의 deprecated 별칭으로 유지

### 🗑️ Deprecated

- `downloadCSV(data, columns, fileName)` — `exportCSV(columns, rows, opts)` 사용 권장
  (기존 함수는 `exportCSV`에 위임하며 injection 가드/RFC 4180 quoting 혜택을 즉시 받음)

### 📚 Documentation

- 신규 가이드
  - `docs/guide/accessibility.md` — 키보드 단축키, 포커스 트랩, ARIA 매트릭스
  - `docs/guide/ux-tips.md` — Shift+Click 다중 정렬, 날짜 프리셋, 빈 상태 CTA 등
  - `docs/guide/controlled-state.md` — v-model 제어 모드
  - `docs/guide/testing.md` — Vitest 설정 가이드
- 보강
  - `docs/guide/typescript.md` — validator/onInput/footer/CellSlotProps/ColumnCellValue 섹션
  - `docs/guide/editing.md` — Undo/Redo 섹션
  - `docs/guide/merge.md` — 병합 + 가상 스크롤 섹션
  - `docs/guide/export.md` — CSV 섹션 전면 개편
  - `docs/guide/performance.md` — `virtualizeWithMerge` 권장 항목
  - `docs/api/props.md`, `docs/api/events.md` — 신규 props/events 전부 반영

### 🔒 Security

- CSV injection(수식 주입) 공격 방어 — OWASP 권장 완화책 기본 탑재

---

## [1.4.x] 이전 변경사항

이전 버전의 변경 내역은 [DOCS.md 푸터](./DOCS.md)의 "최종 업데이트" 및 Git 커밋 로그를 참고하세요.

[1.5.0]: https://github.com/cheerjo/wz-grid/compare/v1.4.3...v1.5.0
