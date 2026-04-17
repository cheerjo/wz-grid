# Events

| 이벤트 | 페이로드 | 설명 |
| :--- | :--- | :--- |
| `@update:cell` | `{ rowIdx, row, colKey, key, value, oldValue }` | 셀 값 변경 시 발생. `key`는 `colKey`의 하위 호환 별칭. `oldValue`는 변경 전 값 |
| `@undo` | `HistoryEntry` | `useUndo=true` + `Ctrl+Z`/`Cmd+Z`로 Undo 발생. 페이로드 `{ rowId, colKey, oldValue, newValue }` — 직후 `@update:cell`이 `value=oldValue`로 재 emit 됨 |
| `@redo` | `HistoryEntry` | `Ctrl+Y` 또는 `Ctrl+Shift+Z`로 Redo 발생. 페이로드 구조는 `@undo`와 동일, `@update:cell`은 `value=newValue`로 재 emit |
| `@update:currentPage` | `number` | 페이지 변경 |
| `@update:pageSize` | `number` | 페이지 크기 변경 |
| `@update:checked` | `any[]` | 체크된 **행 객체** 배열 변경 (하위 호환용) |
| `@update:checkedIds` | `(string\|number)[]` | 체크된 행의 **id 배열** 변경. `v-model:checkedIds`로 양방향 바인딩 |
| `@update:sort` | `SortConfig[]` | 정렬 구성 변경. `v-model:sort`로 양방향 바인딩 |
| `@sort` | `SortConfig[]` | 다중 정렬 변경 시 발생 (하위 호환용, `@update:sort`와 동시 emit) |
| `@resize:column` | `{ colIdx, colKey, width }` | 컬럼 너비 조절 시 실시간 발생 |
| `@reorder:columns` | `{ srcKey, targetKey }` | 컬럼 드래그 재배치 완료 |
| `@reorder:rows` | `{ from, to, position }` | 행 드래그 재배치 완료. `position`: `'above'` \| `'below'` |
| `@click:add` | — | 툴바 추가 버튼 클릭 |
| `@click:insert` | `{ position, row }` | 컨텍스트 메뉴 행 추가 |
| `@click:delete` | `any[]` | 삭제 버튼 또는 컨텍스트 메뉴 행 삭제 |
| `@click:button` | `{ rowIdx, row, colKey }` | `button` 타입 셀 클릭 |
| `@click:row` | `{ rowIdx, row }` | 데이터 행 클릭 |
| `@update:filters` | `Record<string, any>` | 필터 변경 시 발생. 서버사이드 모드 또는 `v-model:filters` 제어 모드에서 활성화. 기본 300ms debounce + IME(한글) 조합 완료까지 자동 보류 (`filterDebounceMs` prop으로 조정) |

## 이벤트 페이로드 타입

모든 이벤트 페이로드는 `wz-grid` 루트에서 타입으로 export됩니다.

```ts
import type {
  CellUpdateEvent,      // @update:cell
  SortChangeEvent,      // @sort
  FilterChangeEvent,    // @update:filters
  SelectionChangeEvent, // 셀/범위 선택 변경
  PagingChangeEvent,    // 페이지/페이지 크기 변경
  CheckedChangeEvent,   // @update:checked
  CellSlotProps,        // #cell-* 스코프드 슬롯 props
  DetailSlotProps,      // #detail 스코프드 슬롯 props
} from 'wz-grid'
```

| 타입 | 대응 이벤트/슬롯 | 비고 |
| :--- | :--- | :--- |
| `CellUpdateEvent<T>` | `@update:cell` | `{ rowIdx, row, colKey, key?, value, oldValue }` — `key`는 `colKey`와 동일한 값의 deprecated 별칭 |
| `HistoryEntry<T>` | `@undo` / `@redo` | `{ rowId, colKey, oldValue, newValue }` — `useUndoRedo`·`useUndo` 히스토리 단위 |
| `SortChangeEvent` | `@sort` | `SortConfig[]` alias |
| `FilterChangeEvent` | `@update:filters` | 컬럼 key → 필터 상태 맵 |
| `SelectionChangeEvent` | 셀/범위 선택 변경 | `{ startRow, startCol, endRow, endCol }` |
| `PagingChangeEvent` | `@update:currentPage`, `@update:pageSize` | `{ currentPage, pageSize }` |
| `CheckedChangeEvent` | `@update:checked` | 체크된 행 id 배열 |
| `CellSlotProps<T>` | `#cell-{key}` | `{ row, column, value, rowIndex }` |
| `DetailSlotProps<T>` | `#detail` | 마스터-디테일 슬롯 스코프 |

::: tip 자동 처리 이벤트
다음 이벤트들은 WZGrid가 **내부적으로 자동 처리**합니다. 핸들러 바인딩 없이도 기능이 동작하며, 외부에서 추가 제어가 필요한 경우에만 핸들러를 연결하면 됩니다:
- `@sort` — 클라이언트 사이드 정렬 자동 수행 (서버사이드 모드 제외)
- `@resize:column` — 컬럼 너비 변경 자동 반영
- `@reorder:columns` — 컬럼 순서 변경 자동 반영
- `@reorder:rows` — 행 순서 변경 자동 반영
:::

## 예제

### @update:cell

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id)
  if (target) (target as any)[colKey] = value
}
```

### @sort

WZGrid는 내부적으로 클라이언트 사이드 정렬을 자동 수행합니다. 서버사이드 모드에서만 외부 핸들러가 필요합니다.

```ts
// 서버사이드 모드에서의 정렬 핸들러 예시
import type { SortConfig } from 'wz-grid'

const handleSort = async (configs: SortConfig[]) => {
  // 서버에 정렬 요청
  const params = configs.map(c => `${c.key}:${c.order}`).join(',')
  const res = await fetch(`/api/data?sort=${params}`)
  rows.value = await res.json()
}
```

```vue
<!-- 서버사이드 모드에서만 핸들러 필요 -->
<WZGrid :serverSide="true" @sort="handleSort" />
```

### @resize:column

WZGrid가 내부적으로 컬럼 너비 변경을 자동 반영합니다. 외부에서 너비를 저장/복원하려는 경우에만 핸들러를 사용합니다.

```ts
// 선택사항: 리사이즈 결과를 로컬 스토리지에 저장
const handleResize = ({ colKey, width }: { colKey: string; width: number }) => {
  localStorage.setItem(`col-width-${colKey}`, String(width))
}
```

### @reorder:columns

WZGrid가 내부적으로 컬럼 순서 변경을 자동 반영합니다. 외부에서 순서를 저장/복원하려는 경우에만 핸들러를 사용합니다.

```ts
// 선택사항: 컬럼 순서 변경을 서버에 저장
const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  fetch('/api/column-order', {
    method: 'POST',
    body: JSON.stringify({ srcKey, targetKey }),
  })
}
```

### @reorder:rows

WZGrid가 내부적으로 행 순서 변경을 자동 반영합니다. 외부에서 순서를 서버에 저장하려는 경우에만 핸들러를 사용합니다.

```ts
// 선택사항: 행 순서를 서버에 저장
const handleReorderRows = ({ from, to, position }: any) => {
  fetch('/api/row-order', {
    method: 'POST',
    body: JSON.stringify({ fromId: from.id, toId: to.id, position }),
  })
}
```
