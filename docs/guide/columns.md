# 컬럼 설정

## 컬럼 고정 (Pinned)

`pinned: true`를 설정하면 해당 컬럼이 좌측에 고정(sticky)됩니다. 수평 스크롤 시에도 항상 화면에 표시됩니다.

```ts
const columns = [
  { key: 'id',   title: 'ID',   width: 60,  pinned: true },
  { key: 'name', title: '이름', width: 120, pinned: true },
  { key: 'dept', title: '부서', width: 100 }, // 스크롤됨
]
```

- 여러 컬럼에 `pinned: true` 지정 가능
- 고정 컬럼들은 순서대로 좌측에 누적 배치 (`left` 오프셋 자동 계산)
- `useCheckbox`, `useRowDrag` 사용 시 해당 너비가 `left` 오프셋에 자동 반영

## 컬럼 리사이즈

헤더 셀 오른쪽 경계에 마우스를 올리면 리사이즈 커서가 표시됩니다.

```ts
const handleResize = ({ colKey, width }: { colKey: string; width: number }) => {
  const col = columns.value.find(c => c.key === colKey)
  if (col) col.width = width
}
```

```vue
<WZGrid ... @resize:column="handleResize" />
```

- 최소 너비: 50px
- 드래그 중 실시간으로 너비 변경 반영
- 리사이즈 중에는 컬럼 드래그 재배치가 차단됨

## 컬럼 드래그 재배치

헤더 셀을 드래그하여 컬럼 순서를 변경할 수 있습니다. 별도 prop 없이 기본 활성화됩니다.

```ts
const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  const cols = [...columns.value]
  const srcIdx    = cols.findIndex(c => c.key === srcKey)
  const targetIdx = cols.findIndex(c => c.key === targetKey)
  if (srcIdx === -1 || targetIdx === -1) return
  const [moved] = cols.splice(srcIdx, 1)
  cols.splice(targetIdx, 0, moved)
  columns.value = cols
}
```

```vue
<WZGrid ... @reorder:columns="handleReorderColumns" />
```

## 컬럼 표시/숨기기

`showColumnSettings` prop을 `true`로 설정하면 헤더 우측에 설정 아이콘이 나타납니다.

```vue
<WZGrid :showColumnSettings="true" ... />
```

- 아이콘 클릭 시 컬럼 목록 드롭다운 표시
- 눈 아이콘 토글로 컬럼 표시/숨기기
- 숨겨진 컬럼은 복사/필터에서도 제외
