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
- [ ] `src/components/` → `packages/vue/src/components/` 이동
- [ ] `src/i18n/` → `packages/vue/src/i18n/` 이동
- [ ] Vue 컴포저블 래퍼 작성 (코어 로직 + ref/computed 감싸기)
- [ ] `packages/vue/src/index.ts` 작성 (WZGrid + 타입 re-export)
- [ ] Vue 래퍼 빌드 설정 (vite.lib.config.ts)
- [ ] Vue 래퍼 빌드 성공 확인

## Phase 5: 통합 검증
- [ ] 기존 테스트 66개 마이그레이션 + 전부 통과
- [ ] 데모 앱 (`npm run dev`) 정상 동작
- [ ] `packages/core`에 vue/vue-demi 의존성 없음 확인
- [ ] VitePress 문서 빌드 정상
- [ ] npm publish dry-run 성공 (core, vue 각각)

---

## 회고
(완료 후 작성)
