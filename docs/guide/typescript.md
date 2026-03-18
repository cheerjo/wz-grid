# TypeScript 가이드

WZ-Grid는 TypeScript를 완전히 지원합니다. 제네릭 타입을 활용하면 컴파일 타임에 row 필드명·컬럼 key 오타를 잡아낼 수 있습니다.

## GridRow\<T\>

`GridRow<T>`는 행 데이터 타입입니다. 제네릭 `T`로 행 스키마를 지정하면 자동완성과 타입 검사를 활용할 수 있습니다.

```ts
import type { GridRow } from 'wz-grid'

// 기본 사용 — 기존 코드와 동일, T = Record<string, any>
const rows: GridRow[] = [
  { id: 1, name: '홍길동', dept: '개발팀' },
]

// 제네릭 사용 — 타입 안전성 강화
interface Employee {
  name: string
  dept: string
  salary: number
}

const rows: GridRow<Employee>[] = [
  { id: 1, name: '홍길동', dept: '개발팀', salary: 5000 },
  // { id: 2, nmae: '김철수' }  // ← 오타 시 컴파일 에러
]
```

> `GridRow<T>` 는 `{ id: string | number } & T` 로 정의됩니다. `id` 필드는 항상 필수입니다.

## Column\<T\>

`Column<T>`에 행 타입 `T`를 전달하면 `key` 속성이 `T`의 필드명으로 제한됩니다.

```ts
import type { Column } from 'wz-grid'

interface Employee {
  name: string
  dept: string
  salary: number
}

const columns: Column<Employee>[] = [
  { key: 'name',   title: '이름',   width: 150 },
  { key: 'dept',   title: '부서',   width: 120 },
  { key: 'salary', title: '급여',   width: 120, type: 'number', align: 'right' },
  // { key: 'age' }  // ← Employee에 없는 필드 → 컴파일 에러
]
```

`key`는 `keyof T & string`으로 추론되므로, 존재하지 않는 필드명 입력 시 IDE에서 즉시 오류를 표시합니다.

## CellUpdateEvent\<T\>

`@update:cell` 이벤트의 페이로드 타입입니다. `T`를 지정하면 `key`와 `row` 필드에 자동완성이 적용됩니다.

```ts
import type { CellUpdateEvent } from 'wz-grid'

interface Employee {
  name: string
  salary: number
}

function onCellUpdate(event: CellUpdateEvent<Employee>) {
  console.log(event.key)      // 'name' | 'salary' 로 추론
  console.log(event.row)      // GridRow<Employee>
  console.log(event.value)    // 새 값
  console.log(event.oldValue) // 이전 값
}
```

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  @update:cell="onCellUpdate"
/>
```

## 전체 예제 (제네릭 적용)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import WZGrid from 'wz-grid'
import type { GridRow, Column, CellUpdateEvent } from 'wz-grid'

interface Employee {
  name: string
  dept: string
  salary: number
}

const columns = ref<Column<Employee>[]>([
  { key: 'name',   title: '이름',   width: 150 },
  { key: 'dept',   title: '부서',   width: 120 },
  { key: 'salary', title: '급여',   width: 120, type: 'number', align: 'right' },
])

const rows = ref<GridRow<Employee>[]>([
  { id: 1, name: '홍길동', dept: '개발팀', salary: 5000 },
  { id: 2, name: '김철수', dept: '사업팀', salary: 4500 },
])

function onCellUpdate({ row, key, value }: CellUpdateEvent<Employee>) {
  const target = rows.value.find(r => r.id === row.id)
  if (target) target[key] = value
}
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    @update:cell="onCellUpdate"
  />
</template>
```

## 하위 호환성

제네릭을 사용하지 않아도 기존 코드는 그대로 동작합니다. `GridRow`는 `GridRow<Record<string, any>>`의 단축형이며, `Column`도 마찬가지입니다.

```ts
// 기존 코드 — 변경 불필요
const rows: GridRow[] = [...]
const columns: Column[] = [...]
```

또한 `GridData`는 `GridRow`의 deprecated alias로 유지됩니다. 신규 코드에서는 `GridRow`를 사용하세요.

```ts
/** @deprecated GridRow를 사용하세요 */
type GridData = GridRow
```
