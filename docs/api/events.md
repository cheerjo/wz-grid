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
| `@click:row` | `{ rowIdx, row }` | 데이터 행 클릭 |
| `@update:filters` | `Record<string, any>` | 서버사이드 모드에서 필터 변경 시 발생 |

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
