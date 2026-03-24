---
name: WZGridRow 분리 리팩토링 주의 패턴
description: WZGrid→WZGridRow 행 렌더링 분리 후 발생하는 고빈도 버그 패턴
type: project
---

WZGrid.vue에서 WZGridRow.vue로 행 렌더링이 분리된 이후, 부모(WZGrid)가 자식(WZGridRow) 내부 DOM 엘리먼트에 직접 접근하던 코드가 무효화된다.

**알려진 사례:**
- `editInput` ref: WZGrid.vue에 `ref<any>(null)`로 선언되고 `startEditing`에서 `.focus()`를 호출했으나, 실제 `ref="editInput"`은 WZGridRow.vue 내부에 있어 항상 null. WZGridRow에 `editingRowId`/`editingColIdx` prop을 추가하고 watch로 자동 포커스 처리하도록 수정.

**Why:** Vue는 자식 컴포넌트 내부의 template ref를 부모 setup ref로 연결하지 않는다.

**How to apply:** WZGrid.vue에서 DOM 직접 접근(ref로 input 찾기 등)을 쓸 때, 해당 DOM이 WZGridRow.vue 내부에 있다면 반드시 prop+watch 패턴으로 대체해야 한다. 같은 패턴이 다른 자식 컴포넌트(WZGridToolbar 등)에서도 발생할 수 있으므로 분리 리팩토링 시 ref 접근 코드를 전수 검사한다.
