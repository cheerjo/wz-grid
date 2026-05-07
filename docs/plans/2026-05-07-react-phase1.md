# React 래퍼 Phase 1 (Quick Wins) 플랜

## Context

React 래퍼 v0.1.0은 Vue 래퍼 대비 약 48% 수준. 갭 분석 결과 21개 기능 추가가 필요. 그중 Phase 1은 **Core 유틸이 이미 구현되어 있어 React Hook으로 래핑만 하면 되는 8개 Quick Wins**.

완료 후 `@wezon/wz-grid-react@0.2.0`으로 publish.

## 목표/범위

Phase 1: 8개 기능을 React 래퍼에 추가
1. **트리 (useTree)** — 현재 stub만 있음, 완성 필요
2. **Undo/Redo** — 현재 stub만 있음, 셀 편집 히스토리 + Ctrl+Z/Y 단축키
3. **클립보드 복붙** — Core `parseTSV`/`stringifyTSV` 활용
4. **컬럼 표시/숨김 설정** — 컬럼 가시성 토글 UI
5. **컬럼 고정 (pinned)** — Column 타입에 이미 `pinned` 필드 있음, CSS sticky
6. **행 확장 (detail)** — Vue의 `useDetail`/`#detail` slot에 해당, React는 children prop
7. **엑셀 + CSV 내보내기** — Core `exportExcel`/`exportCSV` 그대로 호출
8. **다국어 (i18n)** — Core `buildTranslations`/`createI18nEngine` 래핑

## 건드릴 파일

### 신규 hooks
- `packages/react/src/hooks/useUndoRedo.ts` (현재 stub → 완성)
- `packages/react/src/hooks/useTree.ts` (현재 stub → 완성)
- `packages/react/src/hooks/useClipboard.ts` (신규)
- `packages/react/src/hooks/useColumnSettings.ts` (신규)
- `packages/react/src/hooks/useI18n.ts` (신규)

### 컴포넌트 수정/추가
- `packages/react/src/components/WZGrid.tsx` — props 확장, 새 hooks 통합
- `packages/react/src/components/WZGridRow.tsx` — pinned/detail 지원
- `packages/react/src/components/WZGridHeader.tsx` — pinned 지원
- `packages/react/src/components/WZGridDetailRow.tsx` (신규) — 행 확장 UI
- `packages/react/src/components/WZGridColumnSettings.tsx` (신규) — 컬럼 표시 설정 패널

### 유틸/스타일
- `packages/react/src/utils/export.ts` (신규) — exportExcel/exportCSV 래퍼
- `packages/react/src/lib.css` — pinned sticky, detail row 스타일

### 진입점
- `packages/react/src/index.ts` — 새 hooks/유틸/컴포넌트 export

### 메타
- `packages/react/package.json` — version 0.2.0
- `packages/react/README.md` — 지원 기능 갱신
- `packages/react/playground/` — 신기능 데모 추가

### 문서
- `docs/guide/react.md` — 지원 기능표 갱신, 예시 코드 추가

## 제약/주의

1. **Core 우선 활용** — 새 로직 작성보다 Core 함수 호출이 우선
2. **Vue 래퍼와 API 일관성** — props 이름은 가능한 Vue와 동일하게 (예: `useUndoRedo`, `useClipboard`)
3. **단순성 유지** — Phase 2/3 기능은 손대지 않음 (그룹핑, 셀 병합, 컬럼 드래그 등)
4. **메이저 버전 변경 금지** — v0.1.0 → v0.2.0 (minor bump). 기존 props 동작 유지
5. **TypeScript 엄격성** — 모든 hooks/props에 명확한 타입
6. **playground 데모** — 신기능 동작 확인 가능하게

## 검증

- [ ] `pnpm --filter @wezon/wz-grid-react build` 성공
- [ ] React playground에서 8개 기능 모두 동작 확인
- [ ] 빌드 결과물에 vue/vue-demi 코드 없음 (재확인)
- [ ] 기존 테스트 66개 통과
- [ ] `npm run docs:build` 성공
- [ ] `docs/guide/react.md`에 신기능 반영
