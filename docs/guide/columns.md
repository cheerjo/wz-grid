# 컬럼 설정

## 라이브 데모

<ClientOnly>
  <DemoColumns />
</ClientOnly>

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

- 최소 너비: 50px, 최대 너비: 600px
- 드래그 중 실시간으로 너비 변경 반영
- 리사이즈 핸들 **더블클릭** 시 컬럼 내용에 맞게 너비 자동 조정 (Auto-fit)
- 리사이즈 중에는 컬럼 드래그 재배치가 차단됨

::: tip Auto-fit
리사이즈 핸들(`|`)을 더블클릭하면 현재 필터링된 데이터 전체를 기준으로 가장 넓은 셀 내용에 맞춰 너비를 자동으로 조정합니다.
`boolean`, `progress`, `image`, `button`, `radio` 타입 컬럼은 헤더 텍스트 너비만 기준으로 합니다.
:::

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

## 말줄임 & 툴팁

긴 텍스트를 셀 너비에 맞게 말줄임(`...`) 처리하고, hover 시 전체 내용을 툴팁으로 표시할 수 있습니다.

```ts
const columns = [
  {
    key: 'address',
    title: '주소',
    width: 160,
    type: 'text',
    truncate: true,  // 기본값 true — false로 설정 시 줄바꿈
    tooltip: true,   // hover 시 전체 내용 표시
  },
]
```

| 옵션 | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `truncate` | `boolean` | `true` | `false`로 설정하면 셀 내용이 줄바꿈됨 |
| `tooltip` | `boolean` | `false` | `true`이면 hover 시 말풍선으로 전체 내용 표시 |

::: tip
`tooltip: true`는 `truncate: true`와 함께 사용할 때 가장 유용합니다.
말줄임으로 잘린 내용을 hover로 확인할 수 있습니다.
:::

## 컬럼 표시/숨기기

`showColumnSettings` prop을 `true`로 설정하면 헤더 우측에 설정 아이콘이 나타납니다.

```vue
<WZGrid :showColumnSettings="true" ... />
```

- 아이콘 클릭 시 컬럼 목록 드롭다운 표시
- 눈 아이콘 토글로 컬럼 표시/숨기기
- 숨겨진 컬럼은 복사/필터에서도 제외
