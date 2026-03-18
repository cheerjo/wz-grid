# Bug Report — 2026-03-16

## Summary
총 4개의 버그 발견, 4개 수정 완료 (BUG-001은 이전 세션, BUG-002~004는 이번 세션)

## 검토 대상 파일
- `src/components/WZGrid.vue`
- `src/components/WZGridRow.vue`
- `src/composables/useSort.ts`

## 발견된 버그

### BUG-001: WZGridRow.vue의 editValue prop mutation으로 인한 셀 편집값 미반영
- **파일**: `src/components/WZGridRow.vue`
- **위치**: 라인 111, 118, 123 (편집 모드 input/select)
- **심각도**: 🔴 Critical
- **설명**: 셀 편집 시 사용자가 입력한 값이 저장되지 않고 편집 시작 당시의 초기값이 저장된다.
- **원인**: WZGridRow에서 편집 input들이 `v-model="editValue"`로 바인딩되어 있었는데, `editValue`는 부모(WZGrid)에서 내려오는 단방향 prop이다. Vue에서 props는 단방향이므로 `v-model`이 prop을 직접 변경하려 하면 런타임 경고 후 반영되지 않는다. 결국 `stopEditing` 호출 시 부모의 `editValue` ref는 `startEditing`에서 설정한 초기값을 그대로 유지하고 있어 편집 내용이 유실된다.
- **수정 내용**:
  1. WZGridRow.vue의 모든 편집 input/select에서 `v-model="editValue"`를 `:value="editValue"` + `@input`/`@change` 이벤트로 교체
  2. 값 변경 시 `$emit('update:editValue', newValue)`를 emit하여 부모 ref를 갱신
  3. WZGridRow.vue의 `emits` 목록에 `'update:editValue'` 추가
  4. WZGrid.vue 템플릿의 `:edit-value="editValue"`를 `v-model:edit-value="editValue"`로 교체하여 `update:editValue` 이벤트를 수신
- **수정 전 (WZGridRow.vue)**:
  ```html
  <input
    v-if="col.type === 'date'"
    ref="editInput" v-model="editValue" type="date"
    ...
    @change="$emit('stop-editing', true)"
  />
  <input
    v-else-if="col.type !== 'select' && col.type !== 'boolean'"
    ref="editInput" v-model="editValue" :type="col.type === 'number' ? 'number' : 'text'"
    ...
    @input="$emit('handle-input', col)"
  />
  <select v-else-if="col.type === 'select'" ref="editInput" v-model="editValue" ...>
  ```
- **수정 후 (WZGridRow.vue)**:
  ```html
  <input
    v-if="col.type === 'date'"
    ref="editInput" :value="editValue" type="date"
    ...
    @input="$emit('update:editValue', ($event.target as HTMLInputElement).value)"
    @change="$emit('stop-editing', true)"
  />
  <input
    v-else-if="col.type !== 'select' && col.type !== 'boolean'"
    ref="editInput" :value="editValue" :type="col.type === 'number' ? 'number' : 'text'"
    ...
    @input="$emit('update:editValue', ($event.target as HTMLInputElement).value); $emit('handle-input', col)"
  />
  <select v-else-if="col.type === 'select'" ref="editInput" :value="editValue" ...
    @change="$emit('update:editValue', ($event.target as HTMLSelectElement).value); $emit('stop-editing', true)">
  ```
- **수정 전 (WZGrid.vue 템플릿)**:
  ```html
  :edit-value="editValue"
  ```
- **수정 후 (WZGrid.vue 템플릿)**:
  ```html
  v-model:edit-value="editValue"
  ```

---

### BUG-002: startEditing에서 editInput ref가 항상 null — 포커스 미동작
- **파일**: `src/components/WZGrid.vue`
- **위치**: 라인 855, 884 (`editInput` ref 선언 및 `startEditing` 함수)
- **심각도**: 🔴 Critical
- **설명**: `editInput = ref<any>(null)`이 WZGrid.vue setup에 선언되고 `startEditing`에서 `editInput.value?.focus()`를 호출하지만, 실제 `ref="editInput"` 바인딩은 WZGridRow.vue 내부 input 엘리먼트에 있다. Vue는 자식 컴포넌트 내부의 template ref를 부모 setup ref로 연결하지 않으므로 `editInput.value`는 항상 `null`이다. 결과적으로 편집 모드 진입 시 input에 포커스가 없어 즉시 타이핑 불가.
- **원인**: WZGrid → WZGridRow 행 렌더링 분리 리팩토링 시 포커스 로직을 자식으로 이전하지 않음.
- **수정 내용**: WZGrid.vue의 `editInput` ref 선언 제거, `startEditing`을 non-async로 변경하고 포커스 시도 코드 삭제. `editing` reactive 객체를 setup return에 추가하여 템플릿에서 접근 가능하게 함.
- **수정 전**:
  ```typescript
  const editInput = ref<any>(null);

  const startEditing = async (rIdx: number, cIdx: number, initialValue?: string) => {
    // ...
    clearSelection(); await nextTick();
    const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value; el?.focus();
    if (initialValue !== undefined) handleInput(col);
  };

  // return:
  isEditing, startEditing, stopEditing, editValue, editInput,
  ```
- **수정 후**:
  ```typescript
  // editInput ref 선언 삭제

  const startEditing = (rIdx: number, cIdx: number, initialValue?: string) => {
    // ...
    clearSelection();
    // 포커스는 WZGridRow가 editingRowId/editingColIdx prop 변화를 watch하여 자동으로 처리
    if (initialValue !== undefined) handleInput(col);
  };

  // return:
  editing, isEditing, startEditing, stopEditing, editValue,
  ```

---

### BUG-003: WZGridRow에 편집 모드 진입 시 자동 포커스 로직 완전 누락
- **파일**: `src/components/WZGridRow.vue`
- **위치**: `setup()` 함수
- **심각도**: 🔴 Critical
- **설명**: WZGridRow.vue가 `ref="editInput"`으로 편집 input을 선언하지만 setup()에서 이 ref를 생성하지 않고, 편집 모드 진입을 감지해 포커스를 부여하는 로직이 전혀 없다. 더블클릭 편집 진입이나 키 입력 편집 진입 모두 input이 포커스를 받지 못함.
- **원인**: BUG-002와 동일 — 행 렌더링 분리 시 포커스 책임이 자식으로 이전되지 않음.
- **수정 내용**: props에 `editingRowId`, `editingColIdx` 추가. setup()에 `editInput ref`와 watch를 추가하여 두 prop의 조합이 변화하고 이 행이 편집 대상일 때 `nextTick` 후 `editInput?.focus()` 호출.
- **수정 전**:
  ```typescript
  import { defineComponent, PropType, h } from 'vue-demi';
  // props에 editingRowId, editingColIdx 없음
  setup(props) {
    const renderParentSlot = (...) => { ... };
    return { renderParentSlot };
  }
  ```
- **수정 후**:
  ```typescript
  import { defineComponent, PropType, h, ref, watch, nextTick } from 'vue-demi';
  // props 추가:
  // editingRowId: { type: [String, Number], default: null }
  // editingColIdx: { type: Number, default: -1 }
  setup(props) {
    const editInput = ref<HTMLInputElement | HTMLSelectElement | null>(null);
    watch(
      () => [props.editingRowId, props.editingColIdx] as const,
      async ([newRowId, newColIdx]) => {
        if (newRowId === null || newColIdx === -1) return;
        if (!props.isEditing(props.itemIdx, newColIdx)) return;
        await nextTick();
        const el = Array.isArray(editInput.value) ? (editInput.value as any)[0] : editInput.value;
        el?.focus();
      },
      { flush: 'post' }
    );
    const renderParentSlot = (...) => { ... };
    return { editInput, renderParentSlot };
  }
  ```

---

### BUG-004: WZGrid.vue에서 사용되지 않는 nextTick import
- **파일**: `src/components/WZGrid.vue`
- **위치**: 라인 336, import 문
- **심각도**: 🔵 Info
- **설명**: BUG-002 수정으로 `startEditing`이 non-async가 되면서 `nextTick`이 WZGrid.vue에서 전혀 사용되지 않는 dead import가 됨.
- **원인**: BUG-002 수정의 연쇄 효과.
- **수정 내용**: import 목록에서 `nextTick` 제거.
- **수정 전**:
  ```typescript
  import { defineComponent, computed, PropType, ref, reactive, nextTick, watch, onMounted, onBeforeUnmount } from 'vue-demi';
  ```
- **수정 후**:
  ```typescript
  import { defineComponent, computed, PropType, ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue-demi';
  ```

---

## 수정 없이 넘어간 항목

### 후보 2: sortedRows의 원본 참조 문제
`useSort.ts`의 `sortedRows`는 `[...rows].sort()`로 배열을 복사하지만, 배열 내 row 객체의 참조는 그대로 유지된다. `stopEditing`에서 `props.rows.findIndex(r => r.id === editing.rowId)`로 원본 배열에서 id로 검색하므로 row 참조 단절 문제는 실제로 발생하지 않는다. 수정 불필요.

### 후보 3: 이벤트 전달 누락
WZGrid.vue 템플릿에서 WZGridRow.vue로의 이벤트 바인딩(`@stop-editing`, `@handle-input` 등)은 모두 올바르게 연결되어 있다. 수정 불필요.

## 권고 사항

- `handleInput`의 실행 순서: WZGridRow에서 `@input` 핸들러가 `update:editValue`와 `handle-input`을 순서대로 emit하므로, 부모의 `editValue.value`가 먼저 갱신된 뒤 `handleInput(col)`이 `col.onInput(editValue.value)`를 적용한다. 이 순서는 올바르며 Vue의 동기적 이벤트 처리에 의존한다.
- 향후 WZGridRow 분리 시 편집 상태(editValue, editInput ref)를 WZGridRow 내부로 완전히 이전하고 `commit-edit` 이벤트로 최종값만 부모에게 전달하는 방식을 고려할 수 있다.
