# 인쇄 & CSV

## 인쇄 (Print)

`printGrid` 유틸 함수로 새 탭에 인쇄 레이아웃을 생성합니다.

```ts
import { printGrid } from 'wz-grid'

// 전체 출력
printGrid(columns.value, rows.value, { title: '출력 제목' })

// 체크된 행만 출력
printGrid(columns.value, rows.value, {
  title: '선택 항목 출력',
  printCheckedOnly: true,
  checkedRows: checkedRows.value,
})
```

**옵션:**

| 옵션 | 타입 | 설명 |
| :--- | :--- | :--- |
| `title` | `string` | 인쇄 제목 (기본: `'그리드 출력'`) |
| `printCheckedOnly` | `boolean` | `true`이면 `checkedRows`만 출력 |
| `checkedRows` | `any[]` | 선택 인쇄 시 사용할 체크된 row 배열 |

- `image`, `button` 타입 컬럼은 출력에서 자동 제외
- `boolean` → `✓` / `✗`, `progress` → `N%`, `select/badge/radio` → label로 변환

## CSV 내보내기

`tsvToRows`, `rowsToTsv` 유틸로 CSV/TSV 데이터를 처리할 수 있습니다.

```ts
import { rowsToTsv } from 'wz-grid'

const handleExportCSV = () => {
  const tsv = rowsToTsv(columns.value, rows.value)
  const blob = new Blob([tsv], { type: 'text/tab-separated-values' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'export.tsv'
  a.click()
  URL.revokeObjectURL(url)
}
```

## 툴바에 버튼 추가

```vue
<WZGrid :showAdd="true" :showDelete="true" @click:add="handleAdd">
  <template #toolbar>
    <button @click="handleExportCSV">CSV 내보내기</button>
    <button @click="handlePrint">인쇄</button>
  </template>
</WZGrid>
```
