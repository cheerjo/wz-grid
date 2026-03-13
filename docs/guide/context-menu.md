# 컨텍스트 메뉴

`useContextMenu` prop을 `true`로 설정하면 행을 우클릭 시 컨텍스트 메뉴가 나타납니다.

```vue
<WZGrid
  :useContextMenu="true"
  @click:insert="handleInsert"
  @click:delete="handleDelete"
/>
```

## 메뉴 항목

| 항목 | 이벤트 | 페이로드 |
| :--- | :--- | :--- |
| 위에 행 추가 | `@click:insert` | `{ position: 'above', row }` |
| 아래에 행 추가 | `@click:insert` | `{ position: 'below', row }` |
| 셀 지우기 | — | 선택 셀 내용 삭제 (내부 처리) |
| 행 삭제 | `@click:delete` | `[row]` (행 객체 배열) |

## 이벤트 처리 예제

```ts
const handleInsert = ({ position, row }: { position: 'above' | 'below', row: any }) => {
  const idx = rows.value.findIndex(r => r.id === row.id)
  const newRow = { id: Date.now(), name: '', dept: '' }
  rows.value.splice(position === 'above' ? idx : idx + 1, 0, newRow)
}

const handleDelete = (targetRows: any[]) => {
  const ids = new Set(targetRows.map(r => r.id))
  rows.value = rows.value.filter(r => !ids.has(r.id))
}
```

- `<Teleport to="body">`를 사용하여 overflow 클리핑 없이 렌더링
- 메뉴 외부 클릭 시 자동으로 닫힘
