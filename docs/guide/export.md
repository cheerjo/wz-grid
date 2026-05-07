# 인쇄 & 내보내기

## 라이브 데모

<ClientOnly>
  <DemoExport />
</ClientOnly>

## 인쇄 (Print)

`printGrid` 유틸 함수로 새 탭에 인쇄 레이아웃을 생성합니다.

```ts
import { printGrid } from '@wezon/wz-grid-vue'

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

CSV 내보내기는 **CSV injection(수식 주입) 방어**와 RFC 4180 준수를 기본 탑재합니다.

### 툴바 버튼으로 내보내기 (권장)

`useCsvExport` prop을 활성화하면 툴바에 **CSV** 버튼이 자동 추가됩니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :use-csv-export="true"
  csv-filename="employees.csv"
  :use-checkbox="true"
/>
```

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `useCsvExport` | `boolean` | `false` | 툴바에 CSV 내보내기 버튼 표시 |
| `csvFilename` | `string` | `'export.csv'` | 저장될 파일명 |
| `csvDelimiter` | `string` | `','` | 필드 구분자 (탭 구분 TSV 원하면 `'\t'`) |

**동작 규칙:**

- `useCheckbox: true` + 체크된 행이 있으면 → **체크된 행만** 내보냅니다.
- 그 외에는 현재 **필터링된 모든 행**(페이징 무관)을 내보냅니다.
- UTF-8 BOM이 포함되어 Excel 한글 깨짐이 방지됩니다.

### 직접 호출: `exportCSV` / `toCSV`

코드에서 직접 CSV를 내려받거나 문자열만 얻을 수 있습니다.

```ts
import { exportCSV, toCSV } from '@wezon/wz-grid-vue'

// 파일 다운로드
exportCSV(columns.value, rows.value, {
  filename: 'employees.csv',
  delimiter: ',',
  checkedRows: selectedRows.value,            // 선택 항목만 export
  transformCell: (value, row, column) => {
    // 예: 날짜 포맷팅
    if (column.key === 'joinedAt') return new Date(value).toLocaleDateString()
    return value
  },
})

// 문자열만 (서버 전송·테스트에 활용)
const csvString = toCSV(columns.value, rows.value)
```

**옵션:**

| 옵션 | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `filename` | `string` | `'export.csv'` | 다운로드 파일명 |
| `delimiter` | `string` | `','` | 필드 구분자 |
| `eol` | `string` | `'\r\n'` | 행 종결자 (RFC 4180 권장) |
| `bom` | `boolean` | `true` | UTF-8 BOM 포함 여부 |
| `checkedRows` | `GridRow<T>[]` | — | 선택된 행만 내보내기 |
| `transformCell` | `(v, row, col) => any` | — | 셀 값 변환 훅 |

### 보안: CSV injection 방어

다음 문자로 시작하는 셀 값은 Excel/Numbers/Sheets에서 수식으로 해석되어 악성 함수(`HYPERLINK`, DDE 등)가 실행될 위험이 있습니다.

- `=`, `+`, `-`, `@`, `\t`, `\r`

`exportCSV` / `toCSV`는 이러한 값 앞에 작은따옴표(`'`)를 자동으로 추가해 문자열로 강제 해석되도록 합니다 (OWASP 권장). 이후 RFC 4180 규칙에 따라 구분자·따옴표·개행을 포함한 값은 `"..."`로 감싸고 내부 `"`는 `""`로 이스케이프합니다.

::: warning 하위 호환
이전 버전의 `downloadCSV(data, columns, fileName)`는 `exportCSV`에 내부적으로 위임하며 **deprecated** 상태로 유지됩니다. 신규 코드에서는 `exportCSV`를 사용하세요.
:::

## Excel 내보내기

Excel 내보내기 기능은 [ExcelJS](https://github.com/exceljs/exceljs)를 사용합니다. wz-grid 설치 시 자동으로 함께 설치됩니다.

### 툴바 버튼으로 내보내기 (권장)

`showExcelExport` prop을 활성화하면 툴바에 **Excel** 버튼이 자동으로 추가됩니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :show-excel-export="true"
  excel-filename="report.xlsx"
  :use-checkbox="true"
/>
```

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `showExcelExport` | `boolean` | `false` | 툴바에 Excel 내보내기 버튼 표시 |
| `excelFilename` | `string` | `'export.xlsx'` | 저장될 파일명 |

**동작 규칙:**
- `useCheckbox: true` + 체크된 행이 있으면 → **체크된 행만** 내보냅니다.
- `image`, `button` 타입 컬럼은 자동 제외됩니다.
- `select`, `badge`, `radio` 타입은 `options` label 값으로 변환됩니다.
- `boolean` → `✓` / `✗`
- `progress` → 숫자(0~100)로 출력되며 셀 포맷 `0"%"` 및 data bar 조건부 서식이 자동 적용됩니다.

### 직접 호출

툴바 버튼 없이 코드로 직접 내보내기를 실행할 수 있습니다.

```ts
import { exportExcel } from '@wezon/wz-grid-vue'

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
