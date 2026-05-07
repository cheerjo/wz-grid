# 편집 & 검증

## 라이브 데모

<ClientOnly>
  <DemoEditing />
</ClientOnly>

## 셀 편집

`text`, `number`, `date`, `datetime`, `select`, `currency`, `email`, `textarea` 타입 컬럼은 더블 클릭 또는 키 입력으로 편집 가능합니다.
`boolean`, `radio`, `rating`, `color`는 클릭 즉시 값이 반영됩니다.
`badge`, `progress`, `image`, `button`, `link`, `tag`, `sparkline`은 편집 불가입니다.

- 더블 클릭 또는 알파벳/숫자 키 입력으로 편집 모드 진입
- `Enter`로 저장 후 동일 컬럼의 다음 행 셀로 포커스 이동 (Excel 동작)
- `textarea` 타입 편집 팝업에서 `Enter`는 줄바꿈을 입력하며, `Ctrl+Enter(또는 Cmd+Enter)`로 입력을 완료합니다.
- 포커스 이탈(blur)로 저장 → `@update:cell` 이벤트 발생
- `Esc`로 편집 취소

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id)
  if (target) (target as any)[colKey] = value
}
```

## 데이터 검증

### required — 필수 입력

```ts
{ key: 'name', title: '이름', required: true }
```

- 헤더에 빨간 `*` 표시
- 빈 값 저장 시 셀에 빨간 테두리 + 오류 메시지
- 셀 호버 시 툴팁으로 오류 내용 표시

### validator — 커스텀 검증

```ts
{
  key: 'age', title: '나이', type: 'number',
  validator: (value, row) => {
    if (value < 0 || value > 150) return '나이는 0~150 사이여야 합니다.'
    return null
  }
}
```

### onInput — 실시간 입력 가공

타이핑 중 값을 실시간으로 변환합니다.

```ts
// 대문자로 자동 변환
{ key: 'code', title: '코드', onInput: (v) => String(v).toUpperCase() }

// 숫자만 허용
{ key: 'phone', title: '전화번호', onInput: (v) => v.replace(/\D/g, '') }
```

**검증 동작 시점:**
- 컴포넌트 마운트 시 전체 rows에 대해 즉시 실행
- `rows` prop 변경 시 자동 재검증
- 셀 편집 후 저장 시 해당 셀 재검증

## Undo / Redo (편집 히스토리)

`useUndo` prop을 활성화하면 셀 편집 히스토리가 자동으로 쌓이고 **Ctrl+Z / Ctrl+Y** 단축키로 되돌릴 수 있습니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :use-undo="true"
  :max-undo-depth="100"
  @update:cell="handleUpdate"
/>
```

| Prop | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `useUndo` | `boolean` | `false` | 편집 히스토리 + 키보드 단축키 활성화 |
| `maxUndoDepth` | `number` | `50` | 최대 depth. 초과 시 오래된 항목 FIFO drain |

**키보드 단축키:**

| 조합 | 동작 |
|:-----|:-----|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |

::: info 단방향 데이터 흐름 유지
WZGrid는 `rows` prop을 직접 mutate 하지 않습니다. Undo/Redo 재생은 **이미 연결돼 있는 `@update:cell` 핸들러**에 역/재 값으로 이벤트를 다시 emit 하는 방식입니다. 즉, 부모의 데이터 쓰기 로직 하나로 편집·언두·리두가 모두 처리됩니다.
:::

```ts
function handleUpdate({ rowIdx, colKey, value }: CellUpdateEvent) {
  // 편집, Undo, Redo 모두 이 핸들러 하나로 처리됨
  rows.value[rowIdx][colKey] = value
}
```

**선택적 `@undo` / `@redo` 이벤트**

Undo/Redo가 발생할 때 부모에게 별도 UI 피드백(예: "되돌렸습니다" 토스트)을 주고 싶으면 구독하세요. 페이로드는 `HistoryEntry` — `{ rowId, colKey, oldValue, newValue }`.

```vue
<WZGrid
  :use-undo="true"
  @update:cell="handleUpdate"
  @undo="(e) => toast('되돌렸습니다: ' + e.colKey)"
  @redo="(e) => toast('다시 실행했습니다: ' + e.colKey)"
/>
```

**직접 Composable 사용**

내부 히스토리 스택을 직접 관리하고 싶다면 `useUndoRedo` 를 그대로 임포트할 수 있습니다 (예: 커스텀 버튼 UI).

```ts
import { useUndoRedo } from '@wezon/wz-grid-vue'

const { push, undo, redo, canUndo, canRedo, clear } = useUndoRedo({
  getMaxDepth: () => 100,
})
```

**주의사항:**

- 히스토리 단위는 **셀 단건**입니다. 여러 셀 일괄 편집(붙여넣기·삭제)은 각 셀마다 별도 entry로 push됩니다.
- `rows` 배열이 교체되거나 편집된 행이 제거되면 해당 entry는 조용히 스킵됩니다 (에러 없음).
- `no-op` 편집(같은 값)은 push되지 않습니다.
