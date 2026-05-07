# Composables 활용 가이드

WZ-Grid가 공개하는 8개 composable을 활용하면 그리드 상태를 외부에서 직접 제어하거나 커스텀 UI를 구축할 수 있습니다.

> Composable별 시그니처·반환값 상세는 [Composables API 레퍼런스](/api/composables)를 참고하세요.

---

## 외부에서 정렬 상태 제어

`useSort`를 직접 사용하면 프로그래매틱하게 정렬을 설정하거나 리셋할 수 있습니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import WZGrid from '@wezon/wz-grid-vue'
import { useSort } from '@wezon/wz-grid-vue'
import type { GridRow, Column, SortConfig } from '@wezon/wz-grid-vue'

const columns = ref<Column[]>([
  { key: 'name',   title: '이름',   width: 150 },
  { key: 'salary', title: '급여',   width: 120, type: 'number' },
])
const rows = ref<GridRow[]>([
  { id: 1, name: '홍길동', salary: 5000 },
  { id: 2, name: '김철수', salary: 4500 },
  { id: 3, name: '이영희', salary: 5500 },
])

const { sortedRows, sortConfigs, toggleSort } = useSort(
  (configs) => console.log('sort:', configs),
  () => rows.value,
  () => false,
  () => columns.value
)

// 프로그래매틱 정렬 초기화
function clearSort() {
  sortConfigs.value = []
}
</script>

<template>
  <button @click="clearSort">정렬 초기화</button>
  <!-- sortedRows를 직접 전달 -->
  <WZGrid :columns="columns" :rows="sortedRows" />
</template>
```

---

## 외부에서 필터 상태 제어

`useFilter`의 `filters` reactive 맵을 직접 수정하면 외부 버튼·인풋으로 필터를 제어할 수 있습니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import WZGrid from '@wezon/wz-grid-vue'
import { useFilter } from '@wezon/wz-grid-vue'
import type { GridRow, Column } from '@wezon/wz-grid-vue'

const columns = ref<Column[]>([
  { key: 'dept',   title: '부서',   type: 'select',
    options: [{ value: 'dev', label: '개발팀' }, { value: 'biz', label: '사업팀' }] },
  { key: 'salary', title: '급여',   type: 'number' },
])
const rows = ref<GridRow[]>([...])

const { filters, filteredRows, clearAllFilters, activeFilterCount } = useFilter(
  () => rows.value,
  () => columns.value,
  () => true  // 항상 활성
)

// 외부에서 특정 부서만 표시
function filterByDept(dept: string) {
  filters['dept'].values = [dept]
}
</script>

<template>
  <div>
    <span>활성 필터: {{ activeFilterCount }}</span>
    <button @click="filterByDept('dev')">개발팀만</button>
    <button @click="clearAllFilters">필터 초기화</button>
  </div>
  <WZGrid :columns="columns" :rows="filteredRows" />
</template>
```

---

## 외부에서 트리 상태 제어

`useTree`의 `expandAll` / `collapseAll`을 외부 버튼에 연결해 전체 펼치기/접기를 제공합니다.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import WZGrid from '@wezon/wz-grid-vue'
import { useFilter, useTree } from '@wezon/wz-grid-vue'
import type { GridRow, Column } from '@wezon/wz-grid-vue'

const columns = ref<Column[]>([...])
const rows = ref<GridRow[]>([
  { id: 1, name: 'CEO', children: [
    { id: 2, name: '개발팀장', children: [
      { id: 3, name: '개발자 A' },
    ]},
  ]},
])

// 필터와 트리를 함께 사용
const { filteredRows, filters } = useFilter(
  () => rows.value,
  () => columns.value,
  () => true
)

// filteredIds: 필터 일치 행 id Set
const filteredIds = computed(() => {
  // filteredRows에서 id Set 추출
  function collectIds(rows: any[]): Set<any> {
    const ids = new Set<any>()
    for (const row of rows) {
      ids.add(row.id)
      if (row.children) collectIds(row.children).forEach(id => ids.add(id))
    }
    return ids
  }
  const query = filters['name']?.value
  if (!query) return null  // 필터 없음
  return collectIds(filteredRows.value)
})

const { flatTreeItems, expandAll, collapseAll } = useTree(
  () => rows.value,
  () => true,
  () => 'children',
  () => filteredIds.value
)
</script>

<template>
  <div>
    <button @click="expandAll">전체 펼치기</button>
    <button @click="collapseAll">전체 접기</button>
  </div>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :use-tree="true"
    tree-key="name"
  />
</template>
```

---

## 체크박스 상태 외부 참조

`useCheckbox`로 체크된 항목을 외부에서 직접 조회하거나 일괄 처리를 실행합니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import WZGrid from '@wezon/wz-grid-vue'
import { useCheckbox } from '@wezon/wz-grid-vue'
import type { GridRow } from '@wezon/wz-grid-vue'

const rows = ref<GridRow[]>([...])

const {
  checkedIds,
  checkedCount,
  isAllChecked,
  toggleAll,
  toggleRow,
} = useCheckbox(
  () => rows.value,
  () => rows.value,
  (checked) => console.log('checked:', checked)
)

// 체크된 항목 일괄 삭제
function deleteChecked() {
  rows.value = rows.value.filter(r => !checkedIds.value.has(r.id))
}
</script>

<template>
  <div>
    <span>{{ checkedCount }}개 선택됨</span>
    <button :disabled="checkedCount === 0" @click="deleteChecked">선택 삭제</button>
  </div>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :use-checkbox="true"
    @check="(checked) => console.log(checked)"
  />
</template>
```

---

## 검증 오류 외부 표시

`useValidation`의 `errors` 맵을 읽어 그리드 외부에 오류 요약을 표시합니다.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import WZGrid from '@wezon/wz-grid-vue'
import { useValidation } from '@wezon/wz-grid-vue'
import type { GridRow, Column } from '@wezon/wz-grid-vue'

const columns = ref<Column[]>([
  { key: 'name',   title: '이름',   required: true },
  { key: 'salary', title: '급여',   type: 'number',
    validator: (v) => v < 0 ? '급여는 0 이상이어야 합니다.' : null },
])
const rows = ref<GridRow[]>([...])

const { errors, validateCell } = useValidation(
  () => rows.value,
  () => columns.value
)

const hasError = computed(() => Object.keys(errors).length > 0)
const errorCount = computed(() => Object.keys(errors).length)

// 저장 전 전체 검증
function save() {
  if (hasError.value) {
    alert(`${errorCount.value}개의 오류를 수정해주세요.`)
    return
  }
  // 저장 로직
}
</script>

<template>
  <div v-if="hasError" class="error-banner">
    {{ errorCount }}개의 오류가 있습니다.
  </div>
  <WZGrid :columns="columns" :rows="rows" />
  <button @click="save">저장</button>
</template>
```

---

## 가상 스크롤 커스텀 컨테이너

`useVirtualScroll`을 직접 사용해 WZGrid 없이 커스텀 가상 리스트를 구현할 수 있습니다.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVirtualScroll } from '@wezon/wz-grid-vue'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `항목 ${i}` })))
const ROW_HEIGHT = 40
const VIEWPORT_HEIGHT = 500

const totalRows = computed(() => items.value.length)

const { visibleRange, topPadding, bottomPadding, onScroll } = useVirtualScroll(
  totalRows,
  () => ROW_HEIGHT,
  () => VIEWPORT_HEIGHT,
  5  // 버퍼
)

const visibleItems = computed(() =>
  items.value.slice(visibleRange.value.startIdx, visibleRange.value.endIdx)
)
</script>

<template>
  <div
    :style="{ height: VIEWPORT_HEIGHT + 'px', overflowY: 'auto' }"
    @scroll="onScroll"
  >
    <div :style="{ paddingTop: topPadding + 'px', paddingBottom: bottomPadding + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        :style="{ height: ROW_HEIGHT + 'px' }"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>
```

---

## composable 조합 패턴

여러 composable을 조합해 완전한 데이터 파이프라인을 구성할 수 있습니다.

```ts
// 정렬 → 행 드래그 순서 → 필터 → 체크박스 순서로 파이프라인 구성
const { sortedRows } = useSort(onSort, () => props.rows, () => false, () => columns.value)
const { reorderedRows } = useRowDragDrop(getRow, onReorder, () => sortedRows.value)
const { filteredRows } = useFilter(() => reorderedRows.value, () => columns.value, () => filterEnabled.value)
const { checkedIds, toggleRow } = useCheckbox(() => filteredRows.value, () => props.rows, onCheck)
const { errors } = useValidation(() => filteredRows.value, () => columns.value)
```

> 이 파이프라인은 WZGrid 내부에서 이미 동일한 순서로 동작합니다. `sort`, `resize:column`, `reorder:columns`, `reorder:rows`는 WZGrid가 자동 처리하므로, 대부분의 경우 Composable을 직접 사용할 필요 없이 그리드 컴포넌트만 배치하면 됩니다.

