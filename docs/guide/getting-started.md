# 빠른 시작

## 기본 예제

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WZGrid } from 'wz-grid'
import type { Column } from 'wz-grid'

const columns = ref<Column[]>([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150 },
  { key: 'age',  title: '나이', width: 80, type: 'number', align: 'right' },
])

const rows = ref([
  { id: 1, name: '홍길동', age: 30 },
  { id: 2, name: '김철수', age: 25 },
])

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id)
  if (target) (target as any)[colKey] = value
}
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="500"
    @update:cell="handleUpdate"
  />
</template>
```

::: tip 필수 조건
각 row 객체에는 반드시 고유한 `id` 필드가 있어야 합니다.
:::

## 편집 가능한 그리드

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WZGrid } from 'wz-grid'
import type { Column } from 'wz-grid'

const columns = ref<Column[]>([
  { key: 'name',  title: '이름',   width: 150, editable: true },
  { key: 'dept',  title: '부서',   width: 120, editable: true, type: 'select',
    options: ['개발', '기획', '디자인'] },
  { key: 'score', title: '점수',   width: 80,  editable: true, type: 'number',
    rules: [{ type: 'min', value: 0 }, { type: 'max', value: 100 }] },
  { key: 'active', title: '활성',  width: 60,  type: 'checkbox' },
])
</script>
```

## 다음 단계

- [Props 전체 명세](/api/props)
- [Column 타입 상세](/api/column-types)
- [이벤트 목록](/api/events)
