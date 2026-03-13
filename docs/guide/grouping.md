# 그룹핑 & 소계

## 그룹핑

`groupBy` prop에 컬럼 key를 지정하면 해당 컬럼 값 기준으로 행을 그룹화합니다.

```vue
<WZGrid :groupBy="'dept'" ... />
```

- 그룹 헤더 행: 컬럼명, 그룹 값, 행 수 표시
- 그룹 헤더 클릭으로 해당 그룹 접기/펼치기 토글
- 소계 행: 각 그룹 하단에 표시. `type: 'number'` 컬럼의 합계 자동 계산
- 그룹핑 활성화 시 페이징은 그룹 구조를 포함한 아이템 기준으로 동작

## 행 드래그 재배치

`useRowDrag` prop을 `true`로 설정하면 각 행 좌측에 드래그 핸들(⠿)이 나타납니다.

```vue
<WZGrid :useRowDrag="true" @reorder:rows="handleReorderRows" />
```

```ts
const handleReorderRows = ({ from, to, position }: {
  from: any
  to: any
  position: 'above' | 'below'
}) => {
  const arr = [...rows.value]
  const fromIdx = arr.findIndex(r => r.id === from.id)
  if (fromIdx === -1) return
  const [moved] = arr.splice(fromIdx, 1)
  const toIdx = arr.findIndex(r => r.id === to.id)
  if (toIdx === -1) return
  arr.splice(position === 'above' ? toIdx : toIdx + 1, 0, moved)
  rows.value = arr
}
```

- `from` / `to` 는 행 객체, `position`은 드롭 위치 (`'above'` | `'below'`)
- 드래그 중 드롭 위치에 파란 인디케이터 표시
