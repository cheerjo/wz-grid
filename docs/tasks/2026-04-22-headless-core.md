# Headless Core 분리 태스크

> 플랜: [2026-04-22-headless-core.md](../plans/2026-04-22-headless-core.md)

## Phase 1: 모노레포 인프라 구축
- [x] pnpm-workspace.yaml 생성
- [x] `packages/core/` 디렉토리 + package.json + tsconfig.json 생성
- [x] `packages/vue/` 디렉토리 + package.json + tsconfig.json 생성
- [x] 루트 package.json을 workspace 루트로 전환
- [x] 루트 tsconfig.json에 project references 설정

## Phase 2: 코어 패키지 — 타입 & 유틸 이동
- [x] `src/types/` → `packages/core/src/types/` 복사 (원본 유지)
- [x] `src/utils/` → `packages/core/src/utils/` 복사 (브라우저 API 주석 표시, 원본 유지)
- [x] `packages/core/src/index.ts` 작성 (타입, 유틸 re-export)
- [x] 코어 빌드 설정 (vite.config.ts — Phase 1에서 완료, exceljs external 처리)
- [x] 코어 단독 빌드 성공 확인 (vue/vue-demi 코드 없음 확인)
- [x] 기존 테스트 66개 통과 확인
- [x] 기존 `build:lib` 빌드 성공 확인

## Phase 3: 코어 패키지 — 컴포저블 순수 TS 변환
- [x] 코어 상태 관리 primitives 정의 (순수함수 + 상태팩토리 패턴 채택)
- [x] useSort → sortRows/computeToggleSort/createSortEngine
- [x] useFilter → filterRows/createFilterEngine
- [x] useTree → flattenTree/buildVisibleIds/createTreeEngine
- [x] useGrouping → buildGroupedItems/createGroupingEngine
- [x] useMerge → computeMerge/getMerge/getMergeSpan
- [x] useVirtualScroll → computeVisibleRange/computePadding/createVirtualScrollEngine
- [x] useSelection → createSelectionEngine
- [x] useCheckbox → createCheckboxEngine
- [x] useUndoRedo → createUndoRedoEngine
- [x] useColumnDrag → createColumnDragEngine
- [x] useRowDragDrop → createRowDragDropEngine
- [x] useI18n → buildTranslations/translate/createI18nEngine (i18n locale도 코어 복사)
- [x] usePlugins → createPluginEngine
- [x] usePerformance → createPerformanceEngine
- [x] useClipboard → buildCopyText/parsePasteData (DOM 의존 제거)
- [x] useColumnSettings → createColumnSettingsEngine (lifecycle 제거)
- [x] useValidation → validateCellValue/createValidationEngine (watch/lifecycle 제거)
- [ ] useFocusTrap → 순수 TS 변환 (getCurrentInstance 제거, DOM 의존 불가피 — Phase 4 래퍼에서 처리)
- [x] packages/core/src/index.ts에 모든 composable export 추가
- [x] pnpm --filter @anthropic/wz-grid-core build 성공 (33.81 kB es / 25.70 kB cjs)
- [x] 빌드 결과물에 vue 관련 코드 없음 확인
- [x] npm run test 66개 통과
- [x] npm run build:lib 성공

## Phase 4: Vue 래퍼 패키지
- [x] `src/components/` → `packages/vue/src/components/` 복사 (WZGrid + 하위 컴포넌트 전체)
- [x] `src/i18n/` → `packages/vue/src/i18n/` 복사
- [x] `src/lib.css` → `packages/vue/src/lib.css` 복사
- [x] Vue 컴포저블 래퍼 작성 18개 (`packages/vue/src/composables/`) — import 경로를 `@anthropic/wz-grid-core`로 교체
- [x] `useFocusTrap` DOM/lifecycle 전용 — 코어 변환 없이 Vue 래퍼에 직접 유지
- [x] 코어와 충돌하는 export 이름 제거 (`MergeRowSpan`, `HistoryEntry`, `TFunction`, `I18N_KEY`, `runStructureValidation`)
- [x] `packages/vue/src/index.ts` 작성 (WZGrid + 코어 re-export + Vue 컴포저블 명시적 export)
- [x] Vue 래퍼 빌드 성공 확인 (155.85 kB es / 120.25 kB cjs, import.meta.env TS 경고는 기존 구조적 문제)
- [x] `npm run build:lib` 성공 (기존 src/ 유지)
- [x] `npm run test` 66개 통과

## Phase 5: 통합 검증
- [x] 기존 테스트 66개 마이그레이션 + 전부 통과
  - vitest.config.ts에 `@anthropic/wz-grid-core`, `wz-grid-vue` alias 추가 (소스 직접 참조)
  - tests/ 모든 파일 import 경로를 packages 경로로 교체
- [x] 데모 앱 (`npm run dev`) 정상 동작
  - vite.config.ts에 동일한 alias 추가
  - src/demos/*.vue 의 WZGrid·Column·downloadCSV·printGrid import를 패키지 경로로 교체
  - `vite ready in 860ms` 확인, 오류 없음
- [x] `packages/core`에 vue/vue-demi 의존성 없음 확인
  - package.json: vue 항목 없음 / dist 빌드 결과물에 "vue" 문자열 0건
- [x] VitePress 문서 빌드 정상 (29.93s 완료)
- [x] npm publish dry-run 성공 (core: 32.5kB / vue: 83.9kB)
  - packages/vue/package.json의 `types` 경로를 `dist/src/index.d.ts`로 수정 (dts 실제 출력 위치)

---

## 회고
Phase 1~5를 통해 WZGrid 모노레포 분리가 완료됐다. 핵심 주의점은 vite-plugin-dts의 `include: ['src']` + `outDir: 'dist'` 조합이 `dist/src/` 구조를 만든다는 점 — package.json `types` 경로를 실제 출력에 맞게 맞춰야 한다. 다음 작업에서 `rollupTypes: true`로 단일 d.ts로 합치는 방안도 검토할 것.
