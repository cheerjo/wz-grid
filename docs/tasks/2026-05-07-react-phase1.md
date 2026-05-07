# React 래퍼 Phase 1 태스크

> 플랜: [2026-05-07-react-phase1.md](../plans/2026-05-07-react-phase1.md)

## 1. 트리 (useTree)
- [x] `useTree` Hook 완성 (collapsedIds 상태, toggle 함수, flatTreeItems 반환)
- [x] WZGrid에서 `useTreeMode`/`treeKey` props 통합
- [x] WZGridRow에서 들여쓰기 + 펼침/접힘 아이콘 렌더
- [x] CSS: 트리 들여쓰기 스타일

## 2. Undo/Redo
- [x] `useUndoRedo` Hook 완성 (Core `createUndoRedoEngine` 래핑)
- [x] WZGrid에서 `useUndoRedo` prop으로 활성화
- [x] 셀 편집 시 history push
- [x] Ctrl+Z / Ctrl+Y 키보드 단축키 핸들러

## 3. 클립보드 복붙
- [x] `useClipboard` Hook 신규 작성 (Core `buildCopyText`/`parsePasteData` 활용)
- [x] WZGrid에서 `useClipboard` prop으로 활성화
- [x] Ctrl+C: 선택 영역 → 클립보드
- [x] Ctrl+V: 클립보드 → 선택 위치 paste

## 4. 컬럼 표시/숨김
- [x] `useColumnSettings` Hook 신규 작성 (Core `createColumnSettingsEngine` 래핑)
- [x] `WZGridColumnSettings.tsx` 컴포넌트 신규 (체크박스 패널)
- [x] WZGrid에서 `useColumnSettings` prop + 토글 버튼

## 5. 컬럼 고정 (pinned)
- [x] WZGridHeader, WZGridRow, WZGridCell이 `column.pinned` 인식
- [x] CSS: position sticky + z-index 처리
- [x] 좌측 고정 지원

## 6. 행 확장 (detail)
- [x] `WZGridDetailRow.tsx` 컴포넌트 신규
- [x] WZGrid에 `renderDetail?: (row) => ReactNode` prop 추가
- [x] WZGridRow에 펼침/접힘 토글 버튼
- [x] expandedIds 상태 관리

## 7. 엑셀 + CSV 내보내기
- [x] `utils/export.ts` 신규 (Core 함수 래퍼)
- [x] WZGrid에 `onExportExcel`/`onExportCsv` props 노출 (툴바 버튼 자동 표시)

## 8. 다국어 (i18n)
- [x] `useI18n` Hook 신규 작성 (Core `createI18nEngine` 래핑)
- [x] WZGrid에 `locale` ('ko' | 'en') + `messages` props
- [x] 모든 UI 텍스트(empty, paging, 정렬 etc.)에 t() 적용

## 9. 마무리
- [x] `packages/react/src/index.ts` — 새 export 추가
- [x] `packages/react/package.json` — version 0.2.0
- [x] `packages/react/README.md` — 지원 기능표 갱신
- [x] `packages/react/playground/main.tsx` — 신기능 데모 추가
- [x] `docs/guide/react.md` — 신기능 반영
- [x] `pnpm --filter @wezon/wz-grid-react build` 성공 (ES: 30.92kB, CJS: 19.71kB)
- [x] 기존 테스트 66개 통과
- [x] `npm run docs:build` 성공

---

## 회고

8개 Quick Win 기능 모두 Core 엔진을 그대로 재사용해 React Hook 래핑만으로 구현 완료. 트리는 이미 stub이 구현되어 있었고, Undo/Redo도 마찬가지. 신규 추가된 것은 useClipboard, useColumnSettings, useI18n, utils/export.ts, WZGridDetailRow, WZGridColumnSettings. WZGrid.tsx가 길어졌으나 8개 기능 통합 특성상 불가피함 — Phase 2에서 sub-composition 분리 검토 필요. 트리 노드 깊이(`__depth`) 주입은 Core `flattenTree`가 DataItem에 이미 주입하는지 확인 필요 (현재 `(row as any).__depth` 사용 중).
