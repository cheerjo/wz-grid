# 인쇄 & 내보내기

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

`downloadCSV` 유틸로 그리드 데이터를 `.csv` 파일로 저장할 수 있습니다.

```ts
import { downloadCSV } from 'wz-grid'

const handleExportCSV = () => {
  downloadCSV(rows.value, columns.value, 'export.csv')
}
```

## Excel 내보내기 <Badge type="warning" text="Pro" />

> **Pro 또는 Enterprise 라이선스**가 있어야 사용할 수 있습니다.

### 툴바 버튼으로 내보내기 (권장)

`showExcelExport` prop을 활성화하면 툴바에 **Excel** 버튼이 자동으로 추가됩니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :show-excel-export="true"
  :license-key="myLicenseKey"
  excel-filename="report.xlsx"
  :use-checkbox="true"
/>
```

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `showExcelExport` | `boolean` | `false` | 툴바에 Excel 내보내기 버튼 표시 |
| `licenseKey` | `string` | `''` | Pro/Enterprise 라이선스 키 |
| `excelFilename` | `string` | `'export.xlsx'` | 저장될 파일명 |

**동작 규칙:**
- 유효한 Pro 라이선스가 없으면 클릭 시 업그레이드 안내 모달이 표시됩니다.
- `useCheckbox: true` + 체크된 행이 있으면 → **체크된 행만** 내보냅니다.
- `image`, `button` 타입 컬럼은 자동 제외됩니다.
- `select`, `badge`, `radio` 타입은 `options` label 값으로 변환됩니다.
- `boolean` → `✓` / `✗`, `progress` → `N%`

### 직접 호출

툴바 버튼 없이 코드로 직접 내보내기를 실행할 수 있습니다.

```ts
import { exportExcel } from 'wz-grid'

exportExcel(columns.value, rows.value, {
  filename: 'report.xlsx',
  sheetName: '직원목록',
  checkedOnly: true,
  checkedRows: checkedRows.value,
})
```

**옵션:**

| 옵션 | 타입 | 설명 |
| :--- | :--- | :--- |
| `filename` | `string` | 저장 파일명 (기본: `export.xlsx`) |
| `sheetName` | `string` | 시트 이름 (기본: `Sheet1`) |
| `checkedOnly` | `boolean` | `true`이면 `checkedRows`만 내보내기 |
| `checkedRows` | `any[]` | 선택 내보내기 시 사용할 row 배열 |

## 툴바에 버튼 직접 추가

커스텀 버튼이 필요한 경우 `#toolbar` 슬롯을 사용합니다.

```vue
<WZGrid :showAdd="true" :showDelete="true" @click:add="handleAdd">
  <template #toolbar>
    <button @click="handleExportCSV">CSV</button>
    <button @click="handlePrint">인쇄</button>
  </template>
</WZGrid>
```
