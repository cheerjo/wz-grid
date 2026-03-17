# 행 클릭 & 행/셀 스타일

행 클릭 이벤트와 동적 스타일 적용 방법을 설명합니다.

## 라이브 데모

<ClientOnly>
  <DemoRowStyle />
</ClientOnly>

## @click:row 이벤트

데이터 행을 클릭하면 `@click:row` 이벤트가 발생합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  @click:row="handleRowClick"
/>
```

```ts
const handleRowClick = ({ rowIdx, row }: { rowIdx: number; row: any }) => {
  console.log('클릭된 행:', row.id, '인덱스:', rowIdx);
};
```

### 이벤트 페이로드

| 속성 | 타입 | 설명 |
|:-----|:-----|:-----|
| `rowIdx` | `number` | `rows` 배열에서의 원본 인덱스 |
| `row` | `any` | 클릭된 행 객체 |

## rowClass -- 행 동적 스타일

함수를 전달하여 행(tr)에 동적으로 CSS 클래스를 적용합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :rowClass="(row, rowIndex) => ({
    'bg-red-50': row.status === 'Inactive',
    'bg-green-50': row.status === 'Active',
    'font-bold': rowIndex === 0,
  })"
/>
```

### 반환값 형식

Vue의 `:class` 바인딩과 동일한 형식을 지원합니다:

| 형식 | 예시 |
|:-----|:-----|
| 문자열 | `'bg-red-50 font-bold'` |
| 배열 | `['bg-red-50', 'font-bold']` |
| 객체 | `{ 'bg-red-50': true, 'font-bold': false }` |

### 함수 시그니처

```ts
rowClass: (row: any, rowIndex: number) => string | string[] | Record<string, boolean> | null
```

## cellClass -- 셀 동적 스타일

함수를 전달하여 개별 셀(td)에 동적으로 CSS 클래스를 적용합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :cellClass="(row, column, rowIndex) => {
    if (column.key === 'salary' && row.salary > 100000) return 'bg-yellow-50 font-bold';
    return null;
  }"
/>
```

### 함수 시그니처

```ts
cellClass: (row: any, column: Column, rowIndex: number) => string | string[] | Record<string, boolean> | null
```

## 조합 예제

행 클릭, 행 스타일, 셀 스타일을 함께 사용하는 예제입니다.

```vue
<script setup lang="ts">
import { ref } from 'vue';

const selectedRowId = ref<number | null>(null);

const handleRowClick = ({ row }: any) => {
  selectedRowId.value = row.id;
};

const rowClass = (row: any) => ({
  'bg-blue-50 border-l-2 border-blue-500': row.id === selectedRowId.value,
  'bg-red-50': row.status === 'Inactive',
});

const cellClass = (row: any, column: any) => {
  if (column.key === 'salary' && row.salary > 100000) return 'bg-yellow-50 font-bold';
  return null;
};
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :rowClass="rowClass"
    :cellClass="cellClass"
    @click:row="handleRowClick"
  />
</template>
```
