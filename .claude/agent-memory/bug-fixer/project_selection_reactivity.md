---
name: selection reactivity pattern
description: WZGridRow에서 isSelected 함수 prop을 통한 cross-component reactive 추적이 불안정한 버그 패턴 및 selectionKey 해결책
type: project
---

방향키 이동 후 이전 셀 하이라이트 잔류 버그 (2026-03-18 수정).

**Why:** `isSelected`가 WZGrid의 `selection` reactive 객체를 클로저로 참조하는 함수 prop이다. Vue의 `shouldUpdateComponent`는 함수 참조가 동일하면 prop 변경 없음으로 판단하여 WZGridRow를 건너뛸 수 있다. `scrollToCell` → `visibleRowsRange` 변경 → WZGrid 리렌더링 시 이 최적화가 발동한다.

**Solution:** WZGrid에 `selectionKey = computed(() => "${s.startRow}:${s.startCol}:${s.endRow}:${s.endCol}")` computed를 추가하고 WZGridRow에 prop으로 전달한다. selection 변경 시 새 문자열 생성 → prop 변경 감지 → `shouldUpdateComponent=true` → 반드시 리렌더링.

**How to apply:** 비슷하게 함수 prop 클로저를 통해 parent reactive 상태를 자식이 읽는 패턴에서 child 리렌더링이 보장되지 않는 경우, "version key" 또는 "state snapshot string" 패턴으로 해결.
