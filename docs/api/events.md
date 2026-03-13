# Events

| 이벤트 | 페이로드 | 설명 |
| :--- | :--- | :--- |
| `@update:cell` | `{ rowIdx, row, colKey, value }` | 셀 값 변경 시 발생 |
| `@update:currentPage` | `number` | 페이지 변경 |
| `@update:pageSize` | `number` | 페이지 크기 변경 |
| `@update:checked` | `any[]` | 체크된 행 배열 변경 |
| `@sort` | `SortConfig[]` | 다중 정렬 변경 시 발생 |
| `@resize:column` | `{ colIdx, colKey, width }` | 컬럼 너비 조절 시 실시간 발생 |
| `@reorder:columns` | `{ srcKey, targetKey }` | 컬럼 드래그 재배치 완료 |
| `@reorder:rows` | `{ from, to, position }` | 행 드래그 재배치 완료. `position`: `'above'` \| `'below'` |
| `@click:add` | — | 툴바 추가 버튼 클릭 |
| `@click:insert` | `{ position, row }` | 컨텍스트 메뉴 행 추가 |
| `@click:delete` | `any[]` | 삭제 버튼 또는 컨텍스트 메뉴 행 삭제 |
| `@click:button` | `{ rowIdx, row, colKey }` | `button` 타입 셀 클릭 |

## 예제

### @update:cell

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id)
  if (target) (target as any)[colKey] = value
}
```

### @sort

```ts
import type { SortConfig } from 'wz-grid'

const handleSort = (configs: SortConfig[]) => {
  if (configs.length === 0) return
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const modifier = order === 'asc' ? 1 : -1
      if (a[key] !== b[key]) return (a[key] > b[key] ? 1 : -1) * modifier
    }
    return 0
  })
}
```

### @resize:column

```ts
const handleResize = ({ colKey, width }: { colKey: string; width: number }) => {
  const col = columns.value.find(c => c.key === colKey)
  if (col) col.width = width
}
```

### @reorder:columns

```ts
const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  const cols = [...columns.value]
  const srcIdx = cols.findIndex(c => c.key === srcKey)
  const targetIdx = cols.findIndex(c => c.key === targetKey)
  const [moved] = cols.splice(srcIdx, 1)
  cols.splice(targetIdx, 0, moved)
  columns.value = cols
}
```
