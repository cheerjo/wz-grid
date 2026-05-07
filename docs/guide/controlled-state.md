# 제어 상태 (v-model)

WZ-Grid는 Vue의 `v-model` 패턴으로 **페이지, 체크, 필터, 정렬** 상태를 부모 컴포넌트 또는 외부 스토어(Pinia/Vuex)에서 완전히 제어할 수 있습니다.

## 지원 목록

| v-model | 프롭 | Emit | 기본 내부 상태 | 비고 |
|:--|:--|:--|:--|:--|
| `v-model:currentPage` | `currentPage: number` | `update:currentPage` | 1 | 기존 |
| `v-model:pageSize`    | `pageSize: number`    | `update:pageSize`    | 20 | 기존 |
| `v-model:checkedIds`  | `checkedIds: any[]`   | `update:checkedIds`  | `[]` | **신규** (1.5.0+) |
| `v-model:filters`     | `filters: Record<string, any>` | `update:filters` | `{}` | **신규** (1.5.0+) |
| `v-model:sort`        | `sort: SortConfig[]`  | `update:sort`        | `[]` | **신규** (1.5.0+) |

::: tip 제어 vs 비제어
해당 prop이 `undefined`이면 WZGrid가 내부 상태(ref)를 관리합니다. prop을 명시하면 그 값이 소스 오브 트루스가 되고, 부모 쪽에서 상태가 유지됩니다.
:::

## v-model:checkedIds

체크된 행의 **id 배열**로 양방향 바인딩합니다. 기존 `@update:checked`(행 객체 배열) 이벤트는 하위 호환을 위해 유지됩니다.

```vue
<script setup>
import { ref } from 'vue'
const checkedIds = ref<(string|number)[]>([])
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :useCheckbox="true"
    v-model:checkedIds="checkedIds"
  />
  <p>선택됨: {{ checkedIds.length }}건</p>
</template>
```

::: warning 하위 호환
`@update:checked="rows => ..."`는 **기존대로 행 객체 배열**을 emit합니다. 그대로 두면 아무 변화 없이 작동합니다. `v-model:checkedIds`는 추가로 제공되는 id 기반 양방향 경로입니다.
:::

## v-model:filters

컬럼별 필터 상태(`Record<string, { value?, values?, min?, max?, from?, to? }>`)를 양방향 바인딩합니다. 내부 동기화는 300ms debounce + IME 조합 보호가 적용됩니다.

```vue
<script setup>
import { ref, watch } from 'vue'
const filters = ref({})
watch(filters, (f) => {
  localStorage.setItem('grid:filters', JSON.stringify(f))
}, { deep: true })
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :useFilter="true"
    v-model:filters="filters"
  />
</template>
```

### emit 동작

| 모드 | `update:filters` payload | 비고 |
|:--|:--|:--|
| 서버사이드 | **활성 키만** 담은 객체 | 기존 동작 유지 (payload 최소화) |
| v-model 제어 모드 (클라이언트) | 전체 필터 스냅샷 | 외부 상태 미러링용 |
| 비제어 + 비서버 | emit 없음 | 기존 동작 유지 |

## v-model:sort

`SortConfig[]` 배열로 양방향 바인딩합니다.

```vue
<script setup>
import { ref } from 'vue'
import type { SortConfig } from '@wezon/wz-grid-vue'
const sort = ref<SortConfig[]>([{ key: 'name', order: 'asc' }])
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    v-model:sort="sort"
    @sort="onLegacySort"
  />
</template>
```

::: tip 기존 `@sort` 이벤트
하위 호환을 위해 그대로 동작합니다. `v-model:sort`와 `@sort`는 동시에 사용 가능합니다.
:::

## 외부 스토어 연동 예시 (Pinia)

```ts
// stores/grid.ts
import { defineStore } from 'pinia'
import type { SortConfig } from '@wezon/wz-grid-vue'

export const useGridStore = defineStore('grid', {
  state: () => ({
    checkedIds: [] as (string|number)[],
    filters: {} as Record<string, any>,
    sort: [] as SortConfig[],
  }),
})
```

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useGridStore } from '@/stores/grid'
const store = useGridStore()
const { checkedIds, filters, sort } = storeToRefs(store)
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    v-model:checkedIds="checkedIds"
    v-model:filters="filters"
    v-model:sort="sort"
  />
</template>
```

## 주의사항

- **외부 prop이 `undefined`**면 그리드가 **내부 상태로 폴백**합니다. 이 상태에서 `update:*` emit을 무시해도 정상 동작합니다.
- **프롭이 한번이라도 제공**되면 그 이후 `undefined`로 다시 설정하지 마십시오. 상태가 초기화되지 않을 수 있습니다. (부모에서 `ref()` 상태 유지 권장)
- v-model 동기화는 얕은 비교(shallow equality)로 순환 업데이트를 방지합니다. 그래도 외부 상태에서 **대량 mutation을 반복 트리거**하면 성능에 영향이 있을 수 있습니다.
- 서버사이드 모드에서 `v-model:filters`를 사용할 때, `@update:filters` debounce payload(활성 키만)와 **양방향 바인딩 payload가 동일한 이벤트**를 공유합니다. 필요하면 `filterDebounceMs: 0`으로 즉시 동기화할 수 있습니다.
