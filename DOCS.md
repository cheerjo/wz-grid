# WZ-Grid 사용 가이드

> Vue 2 & 3를 모두 지원하는 엔터프라이즈급 고성능 그리드 컴포넌트.
> 가상 스크롤, 엑셀 복사/붙여넣기, 10종 이상의 컬럼 타입, 페이징, 실시간 검증 등을 기본 제공합니다.

---

## 목차

1. [빠른 시작](#1-빠른-시작)
2. [Props 명세](#2-props-명세)
3. [Column 설정](#3-column-설정)
4. [컬럼 타입 상세](#4-컬럼-타입-상세)
5. [Events](#5-events)
6. [페이징](#6-페이징)
7. [가상 스크롤](#7-가상-스크롤)
8. [정렬 (Sort)](#8-정렬-sort)
9. [필터 (Filter)](#9-필터-filter)
10. [컬럼 표시/숨기기](#10-컬럼-표시숨기기)
11. [컬럼 드래그 재배치](#11-컬럼-드래그-재배치)
12. [행 드래그 재배치](#12-행-드래그-재배치)
13. [그룹핑 & 소계](#13-그룹핑--소계)
14. [셀 병합](#14-셀-병합)
15. [컨텍스트 메뉴](#15-컨텍스트-메뉴)
16. [셀 선택 & 키보드 단축키](#16-셀-선택--키보드-단축키)
17. [복사 / 붙여넣기 (Excel 연동)](#17-복사--붙여넣기-excel-연동)
18. [데이터 검증 (Validation)](#18-데이터-검증-validation)
19. [컬럼 고정 (Pinned)](#19-컬럼-고정-pinned)
20. [컬럼 리사이즈](#20-컬럼-리사이즈)
21. [툴바 (Toolbar)](#21-툴바-toolbar)
22. [체크박스](#22-체크박스)
23. [말줄임 & 툴팁](#23-말줄임--툴팁)
24. [인쇄 (Print)](#24-인쇄-print)
25. [CSV 내보내기](#25-csv-내보내기)
26. [Excel 내보내기](#26-excel-내보내기)
27. [종합 예제](#27-종합-예제)
29. [내부 구조 (Architecture)](#29-내부-구조-architecture)
30. [트리 구조 (Tree Grid)](#30-트리-구조-tree-grid)
31. [푸터 집계 행](#31-푸터-집계-행)
32. [셀 커스텀 렌더러 (Custom Cell Renderer)](#32-셀-커스텀-렌더러-custom-cell-renderer)
33. [행 클릭 & 행/셀 스타일](#33-행-클릭--행셀-스타일)
34. [서버사이드 모드](#34-서버사이드-모드)
35. [마스터-디테일 Row Expand](#35-마스터-디테일-row-expand)

---

## 1. 빠른 시작

```vue
<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from './components/WZGrid.vue';
import type { Column, GridRow } from './types/grid';

const columns = ref<Column[]>([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150 },
  { key: 'age',  title: '나이', width: 80, type: 'number', align: 'right' },
]);

// GridRow: id 필드(string | number)가 필수인 인터페이스
const rows = ref<GridRow[]>([
  { id: 1, name: '홍길동', age: 30 },
  { id: 2, name: '김철수', age: 25 },
]);

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="500"
    @update:cell="handleUpdate"
  />
</template>
```

> **필수 조건**: 각 row 객체에는 반드시 고유한 `id` 필드가 있어야 합니다.

---

## 2. Props 명세

> **네이밍 규칙**: "기능 활성화" props는 `use` 접두어로 통일하는 것을 권장합니다.
> 하위 호환을 위해 기존 이름도 계속 동작하지만, 신규 코드에서는 **권장 이름**을 사용하세요.
> `showAdd`, `showDelete`, `showFooter`는 "표시 여부"라는 의미가 명확하므로 변경 없이 유지됩니다.

| Prop | 권장 이름 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `columns` | — | `Column[]` | — | **(필수)** 컬럼 정의 배열 |
| `rows` | — | `GridRow[]` | — | **(필수)** 행 데이터 배열. 각 객체는 `id: string \| number` 필드 필요 |
| `height` | — | `number` | `500` | 그리드 전체 높이(px) |
| `rowHeight` | — | `number` | `40` | 각 행의 높이(px). 가상 스크롤 계산에 사용 |
| `usePaging` | — | `boolean` | `false` | 페이징 활성화 여부 |
| `pageSize` | — | `number` | `20` | 페이지당 표시 행 수 (`v-model:pageSize` 지원) |
| `currentPage` | — | `number` | `1` | 현재 페이지 번호 (`v-model:currentPage` 지원) |
| `useCheckbox` | — | `boolean` | `false` | 첫 번째 컬럼에 체크박스 활성화 여부 |
| `showAdd` | — | `boolean` | `false` | 툴바에 기본 추가 버튼 표시 여부 |
| `showDelete` | — | `boolean` | `false` | 툴바에 기본 삭제 버튼 표시 여부 |
| `useFilter` | — | `boolean` | `false` | 컬럼별 필터 입력 행 표시 여부 |
| `showColumnSettings` ⚠️ | `useColumnSettings` | `boolean` | `false` | 헤더 우측 컬럼 표시/숨기기 설정 버튼 표시 |
| `groupBy` | — | `string` | `''` | 그룹핑 기준 컬럼 key. 빈 문자열이면 그룹핑 없음 |
| `useContextMenu` | — | `boolean` | `false` | 우클릭 컨텍스트 메뉴 사용 여부 |
| `useRowDrag` | — | `boolean` | `false` | 행 드래그 핸들 표시 및 재배치 기능 활성화 |
| `autoMergeCols` | — | `string[]` | `[]` | 인접한 동일 값 셀을 자동 병합할 컬럼 key 목록 |
| `mergeCells` | — | `(row, colKey) => { rowspan?, colspan? } \| null` | `null` | 셀별 병합 규칙을 반환하는 함수. 병합하지 않을 경우 `null` 반환 |
| `showExcelExport` ⚠️ | `useExcelExport` | `boolean` | `false` | 툴바에 Excel 내보내기 버튼 표시 |
| `excelFilename` | — | `string` | `'export.xlsx'` | Excel 내보내기 시 저장 파일명 |
| `useCsvExport` | — | `boolean` | `false` | 툴바에 CSV 내보내기 버튼 표시 (CSV injection 가드 포함) |
| `csvFilename` | — | `string` | `'export.csv'` | CSV 내보내기 시 저장 파일명 |
| `csvDelimiter` | — | `string` | `','` | CSV 필드 구분자 (탭 구분 원하면 `'\t'`) |
| `useUndo` | — | `boolean` | `false` | 셀 편집 Undo/Redo 활성화. `Ctrl+Z` / `Ctrl+Y` / `Ctrl+Shift+Z` 단축키 바인딩 |
| `maxUndoDepth` | — | `number` | `50` | Undo 히스토리 최대 depth. 초과 시 오래된 항목 FIFO drain |
| `showFooter` | — | `boolean` | `false` | 그리드 하단에 집계 행 표시 여부. 컬럼별 `footer` 속성으로 집계 방식 지정 |
| `useTree` | — | `boolean` | `false` | 트리(계층) 구조 모드 활성화. `rows`에 `children` 배열을 중첩해 사용 |
| `treeKey` | — | `string` | `''` | 트리 인덴트·토글 버튼을 표시할 컬럼 key. 미지정 시 첫 번째 컬럼 |
| `childrenKey` | — | `string` | `'children'` | 자식 행 배열 필드명 |
| `rowClass` | — | `(row, rowIndex) => any` | `null` | 행에 동적 CSS 클래스를 적용하는 함수 |
| `cellClass` | — | `(row, column, rowIndex) => any` | `null` | 셀에 동적 CSS 클래스를 적용하는 함수 |
| `serverSide` ⚠️ | `useServerSide` | `boolean` | `false` | 서버사이드 모드. 정렬/필터/페이징을 서버에 위임 |
| `totalRows` | — | `number` | `0` | 서버사이드 모드에서 전체 행 수 (페이징 UI에 사용) |
| `filterDebounceMs` | — | `number` | `300` | 서버사이드 모드에서 필터 입력 시 `update:filters` emit 지연(ms). IME(한글) 조합 중에는 조합 종료 후에만 emit합니다. `0`이면 즉시 emit |
| `loading` | — | `boolean` | `false` | 로딩 상태. `true`면 데이터 영역 위에 `#loading` 슬롯(미지정 시 기본 스켈레톤)을 오버레이하고 `aria-busy="true"`를 설정합니다 |
| `loadingRowCount` | — | `number` | `5` | 기본 스켈레톤 행 수. `#loading` 슬롯을 사용하면 무시됩니다 |
| `emptyText` | — | `string` | `''` | 빈 상태 텍스트 오버라이드. 미지정 시 `aria.empty` i18n 메시지를 사용합니다. `#empty` 슬롯 사용 시 무시됩니다 |
| `debug` | — | `boolean` | `false` | 개발 시 데이터 유효성 경고 활성화. rows id 누락, 컬럼 key 불일치, select options 미지정을 감지. 프로덕션에서는 `false`로 설정 |
| `locale` | — | `'ko' \| 'en' \| string` | `'ko'` | 표시 언어. `'ko'`(기본), `'en'`, 또는 `messages`와 함께 커스텀 locale 문자열 사용 가능 |
| `messages` | — | `Messages` | `null` | 특정 UI 메시지 부분 오버라이드. 7개 네임스페이스(toolbar·filter·grid·pagination·contextMenu·validation·aria) |
| `plugins` | — | `WZGridPlugin[]` | `[]` | 라이프사이클 훅 플러그인 배열. `install(ctx)` 내에서 `ctx.on(hook, callback)` 으로 훅 등록 |
| `performance` | — | `boolean` | `false` | 성능 측정 활성화. 정렬·필터·렌더 소요 시간을 `@perf` 이벤트로 emit. `debug=true` 시 console.table 출력 |

> ⚠️ 표시된 prop은 deprecated이며, 권장 이름 컬럼의 alias로 대체 예정입니다.
> 두 이름 모두 동작하며, 둘 중 하나라도 `true`이면 기능이 활성화됩니다.
> deprecated prop을 사용하면 콘솔에 `[WZGrid] "oldProp" prop은 deprecated입니다. "newProp"을 사용하세요.` 경고가 세션당 1회 출력됩니다.

---

## 2-1. TypeScript 제네릭 타입

WZ-Grid는 행 데이터 스키마를 제네릭으로 지정해 타입 안전성을 강화할 수 있습니다.

```ts
import type { GridRow, Column, CellUpdateEvent } from 'wz-grid'

interface Employee { name: string; dept: string; salary: number }

// GridRow<T> — id 필드 자동 포함
const rows: GridRow<Employee>[] = [{ id: 1, name: '홍길동', dept: '개발팀', salary: 5000 }]

// Column<T> — key가 T의 필드명으로 제한됨
const columns: Column<Employee>[] = [{ key: 'name', title: '이름' }]

// CellUpdateEvent<T> — 이벤트 핸들러 타입 안전성
function onUpdate({ row, key, value }: CellUpdateEvent<Employee>) { ... }
```

> 제네릭을 사용하지 않아도 `GridRow[]`, `Column[]` 그대로 동작합니다. 기존 코드 변경 불필요.
> `GridData`는 `GridRow`의 deprecated alias로 유지됩니다.

---

## 3. Column 설정

`Column` 인터페이스 전체 필드:

```ts
interface Column {
  key: string;           // row 객체의 데이터 키 (필수)
  title: string;         // 헤더에 표시할 텍스트 (필수)
  width?: number;        // 컬럼 너비(px), 기본 150
  type?: ColumnType;     // 컬럼 타입 (기본 'text')
  align?: Align;         // 셀 본문 정렬: 'left' | 'center' | 'right'
  headerAlign?: Align;   // 헤더 텍스트 정렬 (미지정 시 'center')
  pinned?: boolean;      // 좌측 고정 컬럼 여부
  required?: boolean;    // 필수 입력 여부 (헤더에 * 표시)
  options?: Option[];    // select/badge/radio/button 타입에서 사용
  validator?: (value: any, row: any) => string | null; // 커스텀 유효성 검사
  onInput?: (value: any) => any; // 입력 중 실시간 값 가공
  truncate?: boolean;    // 내용이 길 때 말줄임표(...) 처리 (기본: true)
  tooltip?: boolean;     // hover 시 전체 내용을 툴팁으로 표시
  footer?: FooterAggr;   // 푸터 집계 방식: 'sum' | 'avg' | 'count' | 'min' | 'max' | 함수
  footerLabel?: string;  // 집계값 앞에 표시할 레이블 (예: '합계')
  // currency 타입 전용 옵션
  currencySymbol?: string; // 통화 기호 (기본: '₩')
  decimals?: number;       // 소수점 자릿수 (기본: 0)
  // rating 타입 전용 옵션
  maxRating?: number;      // 최대 별점 수 (기본: 5)
  // sparkline 타입 전용 옵션
  sparklineType?: 'line' | 'area' | 'bar' | 'column'; // 차트 타입 (기본: 'line')
  sparklineColor?: string;  // 라인/막대 색상 (기본: '#3b82f6')
  sparklineHeight?: number; // SVG 높이 px (기본: 32)
}

interface Option {
  label: string;
  value?: any;    // button 타입 등 value가 필요 없는 경우 생략 가능
  color?: string; // badge 타입에서 Tailwind 클래스 지정
}

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select'
                | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio'
                | 'tag' | 'currency' | 'rating' | 'datetime' | 'color' | 'email'
                | 'sparkline'   // 숫자 배열을 SVG 미니 라인 차트로 렌더링
                | 'textarea';   // 멀티라인 텍스트 편집

type Align = 'left' | 'center' | 'right';
```

---

## 4. 컬럼 타입 상세

### `text` (기본값)

일반 텍스트. 더블 클릭 또는 즉시 타이핑으로 편집.

```ts
{ key: 'name', title: '이름', type: 'text', width: 150 }
```

### `number`

숫자 값. 읽기 모드에서 `toLocaleString()`으로 천 단위 쉼표 포맷 표시. 편집 시 `<input type="number">`.

```ts
{ key: 'salary', title: '급여', type: 'number', align: 'right', width: 120 }
```

### `date`

날짜를 표시하고, 편집 시 브라우저 기본 달력(datepicker) UI를 사용합니다.
값은 `YYYY-MM-DD` 형식 문자열로 저장됩니다.
날짜 셀에서 알파벳/숫자 즉시 타이핑은 무시되며, Enter 또는 더블 클릭으로만 달력을 엽니다.

```ts
{ key: 'joinDate', title: '입사일', type: 'date', width: 130, align: 'center' }
```

### `boolean`

체크박스로 표시. 클릭 즉시 `@update:cell` 이벤트 발생. 더블 클릭 편집 불가.

```ts
{ key: 'active', title: '활성', type: 'boolean', align: 'center', width: 80 }
```

### `select`

드롭다운 셀렉트. `options` 배열의 `value`로 저장하고 `label`로 표시.

```ts
{
  key: 'dept', title: '부서', type: 'select', width: 130,
  options: [
    { value: 'dev',  label: '개발팀' },
    { value: 'biz',  label: '사업팀' },
    { value: 'hr',   label: '인사팀' },
  ]
}
```

### `badge`

색상 태그 표시. `options`의 `color`에 Tailwind 클래스 조합을 문자열로 지정.

```ts
{
  key: 'status', title: '상태', type: 'badge', align: 'center', width: 100,
  options: [
    { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
    { value: 'Pending',  label: '대기', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
  ]
}
```

> `color` 미지정 시 기본값: `bg-blue-100 text-blue-600`

### `progress`

0~100 숫자 값을 파란색 프로그레스 바로 표시. 직접 편집 불가.

```ts
{ key: 'completion', title: '완료율', type: 'progress', width: 150 }
```

### `image`

URL 값을 `38×38` 원형 썸네일로 표시. 직접 편집 불가.

```ts
{ key: 'avatar', title: '사진', type: 'image', width: 60, align: 'center' }
```

### `button`

클릭 가능한 버튼 셀. `options[0].label`이 버튼 텍스트가 됩니다.
클릭 시 `@click:button` 이벤트 발생.

```ts
{
  key: 'action', title: '관리', type: 'button', align: 'center', width: 100,
  options: [{ label: '상세보기' }]
}
```

### `link`

URL 값을 클릭 가능한 하이퍼링크로 표시. `target="_blank"`로 새 탭 열림.

```ts
{ key: 'website', title: '홈페이지', type: 'link', width: 200 }
```

### `radio`

인라인 라디오 버튼 그룹. 선택 즉시 `@update:cell` 이벤트 발생.

```ts
{
  key: 'gender', title: '성별', type: 'radio', align: 'center', width: 120,
  options: [
    { label: '남', value: 'M' },
    { label: '여', value: 'F' },
  ]
}
```

### `tag`

`string[]` 배열 데이터를 칩(chip) UI로 렌더링. 직접 편집 불가.
필터는 텍스트 포함 여부로 동작하며, 정렬은 태그 개수 기준으로 처리됩니다.

```ts
{ key: 'tags', title: '태그', type: 'tag', width: 200 }
// row.tags 예: ['긴급', '검토중']
```

### `currency`

숫자 데이터를 통화 기호 + 천 단위 포맷으로 표시. 편집 시 `<input type="number">`.
`currencySymbol`(기본 `'₩'`)과 `decimals`(기본 `0`) 컬럼 옵션을 지원합니다.
필터는 min/max 숫자 범위로 동작합니다.

```ts
{
  key: 'price', title: '가격', type: 'currency', align: 'right', width: 140,
  currencySymbol: '₩',
  decimals: 0,
}
```

### `rating`

숫자 값(1~N)을 별점(★) UI로 표시. 클릭 즉시 `@update:cell` 이벤트 발생.
`maxRating` 컬럼 옵션으로 최대 별 수를 지정합니다(기본 `5`).
필터는 min/max 숫자 범위로 동작합니다.

```ts
{ key: 'score', title: '평점', type: 'rating', align: 'center', width: 140, maxRating: 5 }
```

### `datetime`

날짜+시간 문자열. 편집 시 `<input type="datetime-local">` 사용.
표시 형식: `YYYY-MM-DD HH:mm`. 필터는 from/to 날짜+시간 범위로 동작합니다.

```ts
{ key: 'createdAt', title: '등록일시', type: 'datetime', width: 160, align: 'center' }
// row.createdAt 예: '2026-03-17 09:30'
```

### `color`

CSS 색상 문자열을 색상 박스로 표시. 색상 피커 클릭 즉시 `@update:cell` 이벤트 발생.
필터는 텍스트 포함 여부로 동작합니다.

```ts
{ key: 'labelColor', title: '색상', type: 'color', align: 'center', width: 80 }
// row.labelColor 예: '#3b82f6'
```

### `email`

이메일 문자열을 `mailto:` 링크로 표시. 편집 시 `<input type="email">`.
필터는 텍스트 포함 여부로 동작합니다.

```ts
{ key: 'email', title: '이메일', type: 'email', width: 200 }
```

### `sparkline`

숫자 배열 데이터를 SVG 미니 차트로 렌더링합니다. 편집 불가.
`sparklineType`으로 4가지 차트 스타일을 선택할 수 있습니다.

| 옵션 | 타입 | 기본값 | 설명 |
|:-----|:-----|:-------|:-----|
| `sparklineType` | `'line' \| 'area' \| 'bar' \| 'column'` | `'line'` | 차트 타입 |
| `sparklineColor` | `string` | `'#3b82f6'` | 라인/막대 색상 |
| `sparklineHeight` | `number` | `32` | SVG 높이(px) |

**차트 타입 설명**

| 타입 | SVG 요소 | 설명 |
|:-----|:---------|:-----|
| `line` | `<polyline>` | 기본 라인 차트 |
| `area` | `<polygon>` | 라인 + 아래 영역 채움 |
| `bar` | `<rect>` | 수평 막대 차트 |
| `column` | `<rect>` | 수직 막대 차트 |

```ts
{
  key: 'trend',
  title: '트렌드',
  type: 'sparkline',
  width: 140,
  sparklineType: 'area',   // 'line' | 'area' | 'bar' | 'column'
  sparklineColor: '#10b981',
  sparklineHeight: 32,
}
// row.trend 예: [30, 72, 45, 88, 61, 95, 42, 78, 55, 90, 33, 67]
```

### `textarea`

멀티라인 텍스트 입력. 더블 클릭 또는 Enter로 편집 모드 진입, 확장 가능한 `<textarea>` 플로팅 팝업을 셀 위에 표시합니다.
읽기 모드에서는 `whitespace-pre`로 줄바꿈 유지. 편집 상태에서는 자연스럽게 `Enter` 키로 줄바꿈을 지원하며, 편집 완료(저장)는 하단의 확인 버튼 또는 `Ctrl+Enter` 단축키를 사용합니다.

```ts
{ key: 'memo', title: '메모', type: 'textarea', width: 200 }
```

---

## 5. Events

| 이벤트 | 페이로드 | 설명 |
| :--- | :--- | :--- |
| `@update:cell` | `{ rowIdx, row, colKey, key, value, oldValue }` | 셀 값이 변경될 때 발생. `key`는 `colKey`의 하위 호환 별칭, `oldValue`는 변경 전 값 |
| `@undo` | `HistoryEntry` | `useUndo=true` + Ctrl+Z로 Undo 발생 시. `{ rowId, colKey, oldValue, newValue }` — 부모는 이 직후 `@update:cell`에서 `value=oldValue`로 복구를 emit 받음 |
| `@redo` | `HistoryEntry` | `useUndo=true` + Ctrl+Y/Ctrl+Shift+Z로 Redo 발생 시. 페이로드 구조는 `@undo`와 동일하지만 `value=newValue`로 재적용 |
| `@update:currentPage` | `number` | 페이지 변경 (`v-model` 사용 권장) |
| `@update:pageSize` | `number` | 페이지 크기 변경 (`v-model` 사용 권장) |
| `@update:checked` | `any[]` | 체크된 **행 객체** 배열 변경 (하위 호환용) |
| `@update:checkedIds` | `(string\|number)[]` | 체크된 행의 **id 배열** 변경 (`v-model:checkedIds` 지원) |
| `@update:sort` | `SortConfig[]` | 정렬 구성 변경 (`v-model:sort` 지원) |
| `@sort` | `SortConfig[]` | 헤더 클릭으로 정렬 변경 시 발생. 다중 정렬 배열 (하위 호환용, `@update:sort`와 동시 emit) |
| `@resize:column` | `{ colIdx, colKey, width }` | 컬럼 너비 드래그 조절 시 실시간 발생 |
| `@reorder:columns` | `{ srcKey, targetKey }` | 컬럼 드래그 재배치 완료 시 발생 |
| `@reorder:rows` | `{ from, to, position }` | 행 드래그 재배치 완료 시 발생. `position`은 `'above'` \| `'below'` |
| `@click:add` | — | 툴바 추가 버튼 클릭 시 발생 (`showAdd`) |
| `@click:insert` | `{ position, row }` | 컨텍스트 메뉴 행 추가 시 발생. `position`은 `'above'` \| `'below'` |
| `@click:delete` | `any[]` | 툴바 삭제 버튼 또는 컨텍스트 메뉴 행 삭제 시 발생. 행 객체 배열 |
| `@click:button` | `{ rowIdx, row, colKey }` | `button` 타입 셀 클릭 시 발생 |
| `@click:row` | `{ rowIdx, row }` | 데이터 행 클릭 시 발생 |
| `@update:filters` | `Record<string, any>` | 필터 변경 시 발생 (서버사이드 모드 또는 `v-model:filters` 제어 모드에서 활성화). `filterDebounceMs`(기본 300ms) 동안 debounce되며 IME 조합 중에는 보류 |
| `@perf` | `PerfEntry` | `performance=true`일 때 정렬·필터·렌더 완료 후 발생. `{ type, duration, count, timestamp }` |

### 이벤트 페이로드 타입

`src/types/grid.ts`에서 export되며, `import type { … } from '@wz-grid/…'`로 임포트할 수 있습니다.

| 타입 | 대상 이벤트 | 구조 |
| :--- | :--- | :--- |
| `CellUpdateEvent<T>` | `@update:cell` | `{ rowIdx, row, colKey, key?, value, oldValue }` — `key`는 `colKey`와 동일한 값의 deprecated 별칭 |
| `HistoryEntry<T>` | `@undo` / `@redo` | `{ rowId, colKey, oldValue, newValue }` — `useUndoRedo` composable의 스택 단위 |
| `SortChangeEvent` | `@sort` | `{ configs: SortConfig[] }` |
| `FilterChangeEvent` | `@update:filters` | `{ filters: Record<string, any>; activeCount: number }` |
| `SelectionChangeEvent` | (내부, 향후 `@selection-change`) | `{ selection: Selection \| null }` |
| `PagingChangeEvent` | (향후 `@paging-change`) | `{ currentPage, pageSize, totalPages, totalCount }` |
| `CheckedChangeEvent` | `@update:checked` | `{ checked: (string \| number)[] }` |
| `CellSlotProps<T>` | `#cell-{key}` 슬롯 | `{ row, column, value, rowIndex }` |
| `DetailSlotProps<T>` | `#detail` 슬롯 | `{ row, rowIndex }` |

### `@update:cell` 처리 예제

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
```

### `@sort` 처리 예제

```ts
import type { SortConfig } from './types/grid';

const handleSort = (configs: SortConfig[]) => {
  if (configs.length === 0) return;
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const modifier = order === 'asc' ? 1 : -1;
      if (a[key] !== b[key]) return (a[key] > b[key] ? 1 : -1) * modifier;
    }
    return 0;
  });
};
```

### `@resize:column` 처리 예제

```ts
const handleResize = ({ colKey, width }: { colKey: string; width: number }) => {
  const col = columns.value.find(c => c.key === colKey);
  if (col) col.width = width;
};
```

---

## 6. 페이징

`usePaging`을 `true`로 설정하면 하단에 페이징 UI가 나타납니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :usePaging="true"
  v-model:currentPage="currentPage"
  v-model:pageSize="pageSize"
/>
```

```ts
const currentPage = ref(1);
const pageSize = ref(20);
```

**페이징 UI 기능:**

| 요소 | 동작 |
| :--- | :--- |
| `«` / `»` | 첫 페이지 / 마지막 페이지로 이동 |
| `‹` / `›` | 이전 페이지 / 다음 페이지로 이동 |
| 숫자 입력 | 직접 페이지 번호 입력 후 Enter |
| Page Size 셀렉트 | 10, 20, 50, 100 중 선택. 변경 시 1페이지로 자동 리셋 |
| Total 표시 | 전체 `rows` 배열 길이 표시 |

**페이징 + 가상 스크롤**: 페이징 활성화 시 현재 페이지 내 행에 대해서만 가상 스크롤이 동작합니다.

---

## 7. 가상 스크롤

`useVirtualScroll` 컴포저블이 자동으로 적용됩니다. 별도 설정 없이 동작합니다.

- 현재 viewport에 보이는 행만 실제 DOM으로 렌더링
- 나머지 행은 `paddingTop` / `paddingBottom`으로 공간만 확보
- 기본 버퍼: 상하 각 5행 (보이는 범위 밖 미리 렌더링)
- 10만 건 이상도 끊김 없이 스크롤 가능

> `rowHeight` prop이 실제 행 높이와 일치해야 스크롤 계산이 정확합니다.

> **셀 병합 활성화 시**: `autoMergeCols` 또는 `mergeCells`를 사용하면 rowspan 처리로 인해 가상 스크롤이 자동으로 비활성화되고 전체 행을 렌더링합니다.

---

## 8. 정렬 (Sort)

헤더 셀 클릭으로 정렬이 즉시 동작합니다.

### 클라이언트 사이드 정렬 (기본 동작)

`serverSide` prop이 `false`(기본값)일 때 WZGrid가 내부적으로 `rows`를 자동 정렬합니다. **별도 이벤트 핸들러 없이 바로 사용 가능합니다.**

- 숫자 컬럼: 수치 크기 기준 정렬
- 날짜 컬럼(ISO 형식 문자열): 날짜 순 정렬
- 텍스트 컬럼: `localeCompare` 기준 정렬

```vue
<!-- 핸들러 없이 클라이언트 정렬 자동 동작 -->
<WZGrid :columns="columns" :rows="rows" />
```

`@sort` 이벤트는 클라이언트 모드에서도 emit됩니다. 정렬 상태를 외부에서 감지하거나 추가 처리가 필요한 경우에만 사용하세요.

```ts
import type { SortConfig } from './types/grid';

// 정렬 상태 감지 예시 (내부 정렬은 이미 자동으로 수행됨)
const handleSort = (configs: SortConfig[]) => {
  console.log('현재 정렬 기준:', configs);
};
```

### 서버사이드 모드에서의 정렬

`serverSide: true` 일 때는 내부 정렬이 비활성화됩니다. `@sort` 이벤트를 받아 API를 재호출하세요.

```ts
const handleSort = (configs: SortConfig[]) => {
  // configs 기반으로 서버 API 재호출
  fetchData({ sort: configs });
};
```

```vue
<WZGrid :serverSide="true" :license-key="key" ... @sort="handleSort" />
```

### 단일 정렬

헤더 클릭 시 오름차순(▲) ↔ 내림차순(▼) 토글. 다시 클릭하면 정렬 해제.

### 다중 정렬 (Multi-Sort)

`Shift + 헤더 클릭`으로 여러 컬럼을 동시에 정렬합니다.

- 정렬된 컬럼 헤더에 순서 번호(①②③…)와 방향 화살표 표시
- 이미 정렬 중인 컬럼을 Shift+클릭하면 방향 토글 → 해제 순으로 변경

---

## 9. 필터 (Filter)

`useFilter` prop을 `true`로 설정하면 헤더 아래에 컬럼별 필터 행이 나타납니다.

```vue
<WZGrid :useFilter="true" ... />
```

- 각 컬럼 입력창에 텍스트를 입력하면 해당 컬럼 값에 대해 부분 일치 필터링 적용
- 여러 컬럼에 동시에 필터 적용 가능 (AND 조건)
- 필터 결과는 페이징과 연동되며, 필터 변경 시 1페이지로 자동 이동

### 고급 필터 모드

컬럼 타입에 따라 고급 필터 UI가 자동으로 적용됩니다:

| 컬럼 타입 | 필터 UI | 설명 |
|:----------|:--------|:-----|
| `text`, `link`, `radio`, `tag`, `color`, `email` | 텍스트 입력 | 부분 일치 검색 |
| `number`, `currency`, `rating` | 최소~최대 범위 입력 | 숫자 범위 필터링 |
| `date` | 시작일~종료일 | 날짜 범위 필터링 |
| `datetime` | from~to 날짜+시간 범위 | 날짜+시간 범위 필터링 |
| `select`, `badge` | 다중 선택 체크박스 드롭다운 | 여러 값을 동시 선택 (OR 조건) |
| `boolean` | 전체/예/아니요 드롭다운 | 불리언 필터 |

**다중 선택 필터 (select / badge):**

- 필터 버튼 클릭 시 체크박스 목록 드롭다운 표시
- 여러 값을 동시에 체크하여 OR 조건으로 필터링
- "전체 선택" / "전체 해제" 버튼 제공
- 선택된 항목 수가 버튼에 배지로 표시 (예: "3개 선택")

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :useFilter="true"
/>
```

---

## 10. 컬럼 표시/숨기기

`showColumnSettings` prop을 `true`로 설정하면 헤더 영역 우측에 설정 아이콘이 나타납니다.

```vue
<WZGrid :showColumnSettings="true" ... />
```

- 아이콘 클릭 시 컬럼 목록 드롭다운 표시
- 각 컬럼의 눈 아이콘 토글로 표시/숨기기 전환
- 숨겨진 컬럼은 그리드에서 렌더링되지 않으며 복사/필터에서도 제외

---

## 11. 컬럼 드래그 재배치

헤더 셀을 드래그하여 컬럼 순서를 변경할 수 있습니다. 별도 prop 없이 기본 활성화됩니다.

- 헤더를 드래그하면 드롭 위치에 파란 인디케이터 선 표시
- 드롭 완료 시 `@reorder:columns` 이벤트로 `{ srcKey, targetKey }` 전달
- 리사이즈 핸들 드래그 중에는 컬럼 재배치가 차단됨

```ts
const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  const cols = [...columns.value];
  const srcIdx    = cols.findIndex(c => c.key === srcKey);
  const targetIdx = cols.findIndex(c => c.key === targetKey);
  if (srcIdx === -1 || targetIdx === -1) return;
  const [moved] = cols.splice(srcIdx, 1);
  cols.splice(targetIdx, 0, moved);
  columns.value = cols;
};
```

```vue
<WZGrid ... @reorder:columns="handleReorderColumns" />
```

---

## 12. 행 드래그 재배치

`useRowDrag` prop을 `true`로 설정하면 각 행 좌측에 드래그 핸들(⠿)이 나타납니다.

```vue
<WZGrid :useRowDrag="true" @reorder:rows="handleReorderRows" />
```

```ts
const handleReorderRows = ({ from, to, position }: { from: any; to: any; position: 'above' | 'below' }) => {
  const arr = [...rows.value];
  const fromIdx = arr.findIndex(r => r.id === from.id);
  if (fromIdx === -1) return;
  const [moved] = arr.splice(fromIdx, 1);
  const toIdx = arr.findIndex(r => r.id === to.id);
  if (toIdx === -1) return;
  arr.splice(position === 'above' ? toIdx : toIdx + 1, 0, moved);
  rows.value = arr;
};
```

- `from` / `to` 는 행 객체 (row), `position`은 드롭 위치 (`'above'` | `'below'`)
- 드래그 중 드롭 위치에 파란 `box-shadow` 인디케이터 표시
- 그룹핑(`groupBy`) 활성화 시에도 드래그 핸들 컬럼은 유지됨

---

## 13. 그룹핑 & 소계

`groupBy` prop에 컬럼 key를 지정하면 해당 컬럼 값 기준으로 행을 그룹화합니다.

```vue
<WZGrid :groupBy="'dept'" ... />
```

- 그룹 헤더 행: 컬럼명, 그룹 값, 행 수 표시
- 그룹 헤더 클릭으로 해당 그룹 접기/펼치기 토글
- 소계 행: 각 그룹 하단에 표시. `type: 'number'` 컬럼의 합계 자동 계산
- 그룹핑 활성화 시 페이징은 그룹 구조를 포함한 아이템 기준으로 동작

---

## 14. 셀 병합

### 자동 병합 (`autoMergeCols`)

지정한 컬럼에서 인접한 동일 값 셀을 위아래로 자동 병합(rowspan)합니다.

```vue
<WZGrid :autoMergeCols="['dept', 'team']" ... />
```

### 수동 병합 (`mergeCells`)

특정 위치의 셀을 직접 지정하여 병합합니다.

```ts
type MergeCell = {
  row: number;    // 시작 행 인덱스
  col: number;    // 시작 열 인덱스
  rowspan?: number; // 세로 병합 수
  colspan?: number; // 가로 병합 수
};
```

```vue
<WZGrid :mergeCells="[{ row: 0, col: 1, rowspan: 3, colspan: 2 }]" ... />
```

> 셀 병합이 활성화되면 가상 스크롤은 자동으로 비활성화됩니다.

---

## 15. 컨텍스트 메뉴

`useContextMenu` prop을 `true`로 설정하면 행을 우클릭 시 컨텍스트 메뉴가 나타납니다.

```vue
<WZGrid
  :useContextMenu="true"
  @click:insert="handleInsert"
  @click:delete="handleDelete"
  ...
/>
```

**메뉴 항목:**

| 항목 | 이벤트 | 페이로드 |
| :--- | :--- | :--- |
| 위에 행 추가 | `@click:insert` | `{ position: 'above', row }` |
| 아래에 행 추가 | `@click:insert` | `{ position: 'below', row }` |
| 셀 지우기 | — | 선택 셀 내용 삭제 (내부 처리) |
| 행 삭제 | `@click:delete` | `[row]` (행 객체 1개짜리 배열) |

- `<Teleport to="body">`를 사용하여 overflow 클리핑 없이 렌더링
- 메뉴 외부 클릭 시 자동으로 닫힘

---

## 16. 셀 선택 & 키보드 단축키

### 마우스 선택

| 동작 | 결과 |
| :--- | :--- |
| 셀 클릭 | 단일 셀 선택 |
| 셀에서 드래그 | 범위 선택 (파란 하이라이트) |
| 더블 클릭 | 해당 셀 편집 모드 진입 |

### 키보드 단축키

| 키 | 동작 |
| :--- | :--- |
| `↑` `↓` `←` `→` | 선택 셀 이동 |
| `Shift + 방향키` | 범위 선택 확장 |
| `Enter` | 비편집 상태: 선택 셀 편집 모드 진입 / 편집 상태: 저장 후 동일 컬럼 다음 행으로 포커스 이동 |
| `Shift + Enter` | `textarea` 타입 편집 중 줄바꿈 입력 |
| `Esc` | 편집 취소 / 선택 해제 |
| `Backspace` / `Delete` | 선택 셀 값 삭제 |
| 알파벳/숫자 키 | 즉시 편집 시작 (입력한 문자로 값 덮어쓰기) |
| `Ctrl+C` / `Cmd+C` | 선택 범위 복사 (TSV 형식) |
| `Ctrl+V` / `Cmd+V` | 클립보드 내용 붙여넣기 |
| `Shift + 헤더 클릭` | 다중 정렬 컬럼 추가 |

> 그리드가 포커스를 받아야 키보드 단축키가 동작합니다. 셀 클릭 또는 그리드 영역 클릭 후 사용하세요.

---

## 17. 복사 / 붙여넣기 (Excel 연동)

`Ctrl+C` / `Ctrl+V`로 엑셀과 데이터를 주고받을 수 있습니다.

**복사 (Grid → Excel)**
1. 마우스로 셀 범위 드래그하여 선택
2. `Ctrl+C` 또는 `Cmd+C`
3. 엑셀에 붙여넣기

**붙여넣기 (Excel → Grid)**
1. 엑셀에서 셀 범위 복사
2. 그리드에서 시작 셀 클릭으로 선택
3. `Ctrl+V` 또는 `Cmd+V`

- 내부적으로 TSV(Tab-Separated Values) 형식을 사용
- 붙여넣기 시 시작 셀 위치부터 오른쪽/아래로 순서대로 입력
- 그리드 범위를 벗어나는 데이터는 무시
- 편집 불가 컬럼(`badge`, `progress`, `image`, `button`, `link`, `tag`, `sparkline`)에는 붙여넣기가 자동으로 차단됨

---

## 18. 데이터 검증 (Validation)

### `required` — 필수 입력

컬럼 정의에 `required: true`를 추가하면:
- 헤더에 빨간 `*` 표시
- 빈 값 저장 시 셀에 빨간 테두리 + 오류 메시지
- 셀 호버 시 툴팁으로 오류 내용 표시

```ts
{ key: 'name', title: '이름', required: true }
```

### `validator` — 커스텀 검증

임의의 검증 로직을 함수로 정의. 오류 시 문자열 반환, 정상 시 `null` 반환.

```ts
{
  key: 'age', title: '나이', type: 'number',
  validator: (value, row) => {
    if (value < 0 || value > 150) return '나이는 0~150 사이여야 합니다.';
    return null;
  }
}
```

### `onInput` — 실시간 입력 가공

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
- 셀 편집 후 저장(Enter/blur) 시 해당 셀 재검증

---

## 19. 컬럼 고정 (Pinned)

`pinned: true`를 설정하면 해당 컬럼이 좌측에 고정(sticky)됩니다.
수평 스크롤 시에도 항상 화면에 표시됩니다.

```ts
const columns = [
  { key: 'id',   title: 'ID',   width: 60,  pinned: true },
  { key: 'name', title: '이름', width: 120, pinned: true },
  { key: 'dept', title: '부서', width: 100 }, // 스크롤됨
];
```

- 여러 컬럼에 `pinned: true` 지정 가능
- 고정 컬럼들은 순서대로 좌측에 누적 배치됨 (`left` 오프셋 자동 계산)
- `useCheckbox`, `useRowDrag` 사용 시 해당 너비(체크박스 40px, 드래그 핸들 28px)가 `left` 오프셋에 자동 반영됨
- 헤더와 바디 모두 동일하게 고정 (z-index 처리)

---

## 20. 컬럼 리사이즈

헤더 셀 오른쪽 경계에 마우스를 올리면 리사이즈 커서가 표시됩니다.
드래그하여 너비를 조절하고, `@resize:column` 이벤트로 결과를 받아 컬럼 정의를 업데이트합니다.

```ts
const handleResize = ({ colKey, width }: { colKey: string; width: number }) => {
  const col = columns.value.find(c => c.key === colKey);
  if (col) col.width = width;
};
```

```vue
<WZGrid ... @resize:column="handleResize" />
```

- 최소 너비: 50px, 최대 너비: 600px
- 드래그 중 실시간으로 너비 변경 반영
- 리사이즈 핸들 **더블클릭** 시 컬럼 내용에 맞게 너비 자동 조정 (Auto-fit)
- 리사이즈 중에는 헤더 정렬 및 컬럼 드래그 재배치가 차단됨

**Auto-fit 동작 방식:**
- canvas `measureText`로 `filteredRows` 전체 셀 값의 텍스트 너비 계산
- 헤더 텍스트(정렬 아이콘·`required *` 포함)와 비교해 가장 넓은 값으로 결정
- `boolean`, `progress`, `image`, `button`, `radio` 타입은 고정 크기이므로 헤더 너비만 기준
- `number` → `toLocaleString()` 포맷, `select`/`badge` → options label 기준으로 측정

---

## 21. 툴바 (Toolbar)

그리드 우측 상단에 버튼 영역을 제공합니다. 기본 제공 버튼과 커스텀 슬롯을 자유롭게 조합할 수 있습니다.

```vue
<WZGrid
  :showAdd="true"
  :showDelete="true"
  @click:add="handleAdd"
  @click:delete="handleDelete"
>
  <template #toolbar>
    <button @click="exportCSV">CSV 내보내기</button>
  </template>
</WZGrid>
```

**기본 제공 버튼:**

| 버튼 | prop | 이벤트 | 페이로드 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| 추가 | `showAdd` | `@click:add` | — | 항상 활성 |
| 삭제 | `showDelete` | `@click:delete` | `any[]` (체크된 행 객체 배열) | 체크된 행이 없으면 비활성 |

**커스텀 슬롯 (`#toolbar`):**
- `<template #toolbar>` 안에 임의의 HTML/컴포넌트 삽입 가능
- 커스텀 슬롯 버튼은 기본 버튼(추가/삭제) 왼쪽에 배치됨

---

## 22. 체크박스

`useCheckbox` prop을 `true`로 설정하면 그리드 첫 번째 컬럼에 체크박스가 추가됩니다.

```vue
<WZGrid
  :useCheckbox="true"
  @update:checked="checkedRows = $event"
  ...
/>
```

| 요소 | 동작 |
| :--- | :--- |
| 헤더 체크박스 | 전체 선택 / 전체 해제 토글 |
| 헤더 (일부 선택 시) | indeterminate(—) 상태 표시 |
| 행 체크박스 | 해당 행 선택 / 해제 |

- 체크 기준은 **전체 rows** (페이지 관계없이 유지)
- `rows` prop이 교체되면 체크 상태 자동 초기화

---

## 23. 말줄임 & 툴팁

### `truncate` — 말줄임표 처리

셀 내용이 컬럼 너비를 초과할 때 `...`으로 자르는 여부를 지정합니다. **기본값은 `true`**.

```ts
// 명시적 비활성화
{ key: 'memo', title: '메모', width: 200, truncate: false }
```

### `tooltip` — 호버 툴팁

`tooltip: true`를 설정하면 셀에 마우스를 올렸을 때 전체 내용을 툴팁으로 표시합니다.

```ts
{
  key: 'address', title: '주소', width: 200,
  truncate: true,
  tooltip: true,
}
```

> 에러가 있는 셀은 에러 툴팁이 우선 표시됩니다.

---

## 24. 인쇄 (Print)

`src/utils/print.ts`의 `printGrid` 유틸 함수로 새 탭에 인쇄 레이아웃을 생성합니다.

> **주의:** `printGrid`는 현재 라이브러리 패키지(`wz-grid`)의 public export에 포함되지 않습니다.
> npm 패키지로 설치한 경우에는 직접 사용할 수 없으며, 소스 코드를 직접 복사하거나 별도로 구현해야 합니다.
> 소스 저장소를 직접 사용하는 경우에는 아래와 같이 상대 경로로 import합니다.

```ts
import { printGrid } from './utils/print';

// 전체 출력
printGrid(columns.value, rows.value, { title: '출력 제목' });

// 체크된 행만 출력
printGrid(columns.value, rows.value, {
  title: '선택 항목 출력',
  printCheckedOnly: true,
  checkedRows: checkedRows.value,
});
```

**옵션:**

| 옵션 | 타입 | 설명 |
| :--- | :--- | :--- |
| `title` | `string` | 인쇄 제목 (기본: `'그리드 출력'`) |
| `printCheckedOnly` | `boolean` | `true`이면 `checkedRows`만 출력 |
| `checkedRows` | `any[]` | 선택 인쇄 시 사용할 체크된 row 배열 |

- `image`, `button` 타입 컬럼은 출력에서 자동 제외
- `boolean` → `✓` / `✗`, `progress` → `N%`, `select/badge/radio` → label로 변환
- 용지 방향: A4 가로

---

## 25. CSV 내보내기

`downloadCSV` 유틸 함수를 사용합니다. `parseTSV`, `stringifyTSV`와 함께 라이브러리 패키지에서 export됩니다.

```ts
// npm 패키지로 설치한 경우
import { downloadCSV } from 'wz-grid';

// 소스 저장소를 직접 사용하는 경우
// import { downloadCSV } from './utils/tsv';

const exportCSV = () => {
  downloadCSV(rows.value, columns.value, 'export.csv');
};
```

---

## 28. 종합 예제

```vue
<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from './components/WZGrid.vue';
import { downloadCSV } from './utils/tsv';
import type { Column, SortConfig } from './types/grid';

const currentPage = ref(1);
const pageSize = ref(20);
const checkedRows = ref<any[]>([]);
const groupByKey = ref('');

const columns = ref<Column[]>([
  { key: 'id',     title: 'ID',     width: 60,  pinned: true, align: 'center' },
  { key: 'name',   title: '이름',   width: 120, pinned: true, required: true },
  {
    key: 'status', title: '상태', width: 100, type: 'badge', align: 'center',
    options: [
      { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
      { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
    ]
  },
  { key: 'salary', title: '급여', width: 130, type: 'number', align: 'right' },
  {
    key: 'dept', title: '부서', width: 120, type: 'select',
    options: [
      { value: 'dev', label: '개발팀' },
      { value: 'biz', label: '사업팀' },
    ]
  },
  { key: 'completion', title: '완료율', width: 150, type: 'progress' },
  {
    key: 'action', title: '관리', width: 100, type: 'button', align: 'center',
    options: [{ label: '상세보기' }]
  },
]);

const rows = ref(
  Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    status: i % 3 === 0 ? 'Inactive' : 'Active',
    salary: Math.floor(Math.random() * 100000) + 30000,
    dept: ['dev', 'biz'][i % 2],
    completion: Math.floor(Math.random() * 100),
  }))
);

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};

const handleSort = (configs: SortConfig[]) => {
  if (configs.length === 0) return;
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const mod = order === 'asc' ? 1 : -1;
      if (a[key] !== b[key]) return (a[key] > b[key] ? 1 : -1) * mod;
    }
    return 0;
  });
};

const handleResize = ({ colKey, width }: any) => {
  const col = columns.value.find(c => c.key === colKey);
  if (col) col.width = width;
};

const handleReorderColumns = ({ srcKey, targetKey }: { srcKey: string; targetKey: string }) => {
  const cols = [...columns.value];
  const srcIdx    = cols.findIndex(c => c.key === srcKey);
  const targetIdx = cols.findIndex(c => c.key === targetKey);
  if (srcIdx === -1 || targetIdx === -1) return;
  const [moved] = cols.splice(srcIdx, 1);
  cols.splice(targetIdx, 0, moved);
  columns.value = cols;
};

const handleReorderRows = ({ from, to, position }: { from: any; to: any; position: 'above' | 'below' }) => {
  const arr = [...rows.value];
  const fromIdx = arr.findIndex(r => r.id === from.id);
  if (fromIdx === -1) return;
  const [moved] = arr.splice(fromIdx, 1);
  const toIdx = arr.findIndex(r => r.id === to.id);
  if (toIdx === -1) return;
  arr.splice(position === 'above' ? toIdx : toIdx + 1, 0, moved);
  rows.value = arr;
};

let _nextId = 1000;
const handleAdd = () => {
  rows.value = [{ id: _nextId++, name: '', status: 'Active', salary: 0, dept: 'dev', completion: 0 }, ...rows.value];
};

const handleInsert = ({ position, row }: { position: 'above' | 'below'; row: any }) => {
  const idx = rows.value.findIndex(r => r.id === row?.id);
  if (idx === -1) return;
  const newRow = { id: _nextId++, name: '', status: 'Active', salary: 0, dept: 'dev', completion: 0 };
  const insertAt = position === 'above' ? idx : idx + 1;
  rows.value = [...rows.value.slice(0, insertAt), newRow, ...rows.value.slice(insertAt)];
};

const handleDelete = (checkedList: any[]) => {
  const ids = new Set(checkedList.map(r => r.id));
  rows.value = rows.value.filter(r => !ids.has(r.id));
};

const handleButtonClick = ({ row }: any) => {
  alert(`${row.name} 상세 보기`);
};

const exportCSV = () => downloadCSV(rows.value, columns.value, 'export.csv');
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="600"
    :usePaging="true"
    :useCheckbox="true"
    :useFilter="true"
    :showColumnSettings="true"
    :showAdd="true"
    :showDelete="true"
    :useContextMenu="true"
    :useRowDrag="true"
    :groupBy="groupByKey"
    v-model:currentPage="currentPage"
    v-model:pageSize="pageSize"
    @update:cell="handleUpdate"
    @update:checked="checkedRows = $event"
    @sort="handleSort"
    @resize:column="handleResize"
    @reorder:columns="handleReorderColumns"
    @reorder:rows="handleReorderRows"
    @click:add="handleAdd"
    @click:insert="handleInsert"
    @click:delete="handleDelete"
    @click:button="handleButtonClick"
  >
    <template #toolbar>
      <button @click="exportCSV">CSV 내보내기</button>
      <button @click="groupByKey = groupByKey ? '' : 'dept'">그룹핑 토글</button>
    </template>
  </WZGrid>
</template>
```

---

## 29. 내부 구조 (Architecture)

```
src/
├── components/
│   ├── WZGrid.vue              # 메인 그리드 컴포넌트 (템플릿 + setup 조립)
│   ├── WZGridPagination.vue    # 페이징 UI 컴포넌트
│   └── WZContextMenu.vue       # 우클릭 컨텍스트 메뉴 컴포넌트
├── composables/
│   ├── useSelection.ts         # 셀 선택 및 범위 선택 로직
│   ├── useClipboard.ts         # 복사/붙여넣기 (TSV 기반)
│   ├── useVirtualScroll.ts     # 가상 스크롤 엔진
│   ├── useFilter.ts            # 컬럼별 텍스트 필터링
│   ├── useSort.ts              # 단일/다중 정렬 상태 관리
│   ├── useGrouping.ts          # 그룹핑 & 소계 아이템 생성
│   ├── useMerge.ts             # 자동/수동 셀 병합 맵 계산
│   ├── useCheckbox.ts          # 행 체크박스 상태 관리
│   ├── useValidation.ts        # required / validator 검증
│   ├── useColumnSettings.ts    # 컬럼 표시/숨기기
│   ├── useColumnDrag.ts        # 헤더 드래그로 컬럼 순서 변경
│   ├── useRowDragDrop.ts       # 행 드래그 핸들로 행 순서 변경
│   └── useTree.ts              # 트리 계층 구조 평탄화 & 토글
├── demos/
│   ├── DemoBasic.vue           # 종합 데모 탭 — 주요 기능 한 번에 체험
│   ├── DemoTree.vue            # 트리 그리드 탭 — 계층 데이터 & 토글
│   ├── DemoColumnTypes.vue     # 컬럼 타입 탭 — 19종 컬럼 타입 + 이벤트 로그
│   └── index.ts                # 데모 탭 레지스트리 (id / label / component)
├── types/
│   └── grid.ts                 # Column, SortConfig, GridItem 등 타입 정의
├── utils/
│   ├── tsv.ts                  # TSV 파싱/직렬화, CSV 다운로드
│   └── print.ts                # 인쇄 유틸
└── index.ts                    # 컴포넌트 및 타입 export
```

> **데모 앱 탭 구성** (`npm run dev` 실행 후 브라우저에서 확인)
>
> | 탭 | 설명 |
> |:---|:-----|
> | 종합 데모 | 페이징, 필터, 정렬, 그룹핑 등 주요 기능 종합 체험 |
> | 트리 그리드 | 계층 데이터 트리 모드 & 펼치기/접기 |
> | **컬럼 타입** | 편집 가능 8종 · 클릭 즉시 반영 4종 · 읽기 전용 7종(sparkline 포함), 총 19종 컬럼 타입 인터랙티브 데모 + 이벤트 로그 패널 |

### WZGrid 내부 데이터 흐름

```
props.rows (GridRow[])
  → sortedRows        (useSort — 클라이언트 정렬. serverSide=true 시 원본 그대로)
  → treeAllFlat       (useTree 모드: 트리 전체 노드 평탄화, 필터 입력용)
  → filteredRows      (useFilter — 컬럼별 AND 필터. serverSide=true 시 비활성화)
  ↓
  [useTree 모드]      flatTreeItems  (useTree — 계층 평탄화, 토글 상태 반영)
  [일반 모드]         flatGroupedItems (useGrouping — DataItem | GroupHeader | SubtotalItem)
  ↓
  activeItems         (트리/일반 통합 computed)
  → pagedItems        (페이징 슬라이싱)
  → visibleRowsRange  (useVirtualScroll — 셀 병합 활성 시 전체 렌더링)
```

### GridRow 인터페이스

`rows` prop에 전달하는 행 데이터의 기본 타입입니다. `id` 필드가 필수입니다.

```ts
interface GridRow {
  id: string | number;  // 행 식별자 (체크박스, 트리, 편집 등 내부 식별에 사용)
  [key: string]: any;   // 컬럼 데이터
}
```

### GridItem 타입

그룹핑 활성화 시 내부 아이템은 세 가지 타입의 union으로 구성됩니다:

```ts
type DataItem     = { type: 'data'; row: GridRow; level?: number; hasChildren?: boolean };
type GroupHeader  = { type: 'group-header'; key: string; label: string; count: number; collapsed: boolean };
type SubtotalItem = { type: 'subtotal'; key: string; count: number; sums: Record<string, number> };
type GridItem     = DataItem | GroupHeader | SubtotalItem;
```

트리 모드에서 `DataItem`의 `level`은 들여쓰기 깊이(0부터 시작), `hasChildren`은 토글 버튼 표시 여부를 나타냅니다.

### 공개 Composable API

`src/index.ts`에서 외부로 export되는 8개 composable. 자세한 내용은 [Composables API 문서](/api/composables)를 참고하세요.

| Composable | 역할 | 공개 여부 |
| :--- | :--- | :---: |
| `useSort` | 단일/다중 정렬 상태 관리 | ✅ |
| `useFilter` | 컬럼별 AND 필터링 | ✅ |
| `useTree` | 트리 접기/펼치기 상태 | ✅ |
| `useCheckbox` | 체크박스 선택 상태 | ✅ |
| `useValidation` | required/validator 셀 검증 | ✅ |
| `useSelection` | 마우스 드래그 범위 선택 | ✅ |
| `useClipboard` | 복사/붙여넣기 (TSV) | ✅ |
| `useVirtualScroll` | 가상 스크롤 렌더 범위 계산 | ✅ |

### useSelection

- `selection`: `{ startRow, startCol, endRow, endCol }` 반응형 객체
- `startSelection / updateSelection / endSelection`: 마우스 드래그 범위 선택
- `isSelected(row, col)`: 특정 셀이 선택 범위 내인지 확인
- `moveSelection(dir, shift, maxRow, maxCol)`: 키보드 방향키 이동

### useVirtualScroll

- 파라미터: `totalRows (Ref<number>)`, `rowHeight`, `viewportHeight`, `buffer (기본 5)`
- `visibleRange`: 렌더링할 행 인덱스 범위 `{ startIdx, endIdx }`
- `topPadding` / `bottomPadding`: 보이지 않는 행의 공간을 padding으로 대체

### useClipboard

- 파라미터: `selection`, `getColumns: () => Column[]`, `getRows: () => any[]`, `updateCell`
- `onCopy(e)`: 선택 범위의 셀 값을 TSV 문자열로 클립보드에 복사
- `onPaste(e)`: 클립보드의 TSV 데이터를 파싱하여 시작 셀부터 `updateCell` 호출 (편집 불가 타입 컬럼은 건너뜀)

### useFilter

- 파라미터: `getRows`, `getColumns`, `isEnabled`
- `filters`: 컬럼 key별 필터 문자열 reactive 맵
- `filteredRows`: 모든 필터를 AND 조건으로 적용한 결과 배열
- `activeFilterCount`: 활성 필터 수, `clearAllFilters()`: 전체 초기화

### useGrouping

- 파라미터: `getFilteredRows`, `getGroupBy`, `getVisibleColumns`, `getColumns`
- `flatGroupedItems`: `GridItem[]` — 그룹 헤더 + 데이터 + 소계 행이 평탄화된 배열
- `collapsedGroups`: 접힌 그룹 key Set, `toggleGroup(key)`: 접기/펼치기

### useMerge

- 파라미터: `getPagedItems`, `getVisibleColumns`, `getAutoMergeCols`, `getMergeCellsFn`
- `hasActiveMerge`: 병합이 하나라도 있으면 `true` (가상 스크롤 비활성화 트리거)
- `getMerge(rowIdx, colIdx)`: 해당 셀의 `{ rowspan, colspan, hidden }` 반환

### useSort

- 파라미터: `onSort: (configs: SortConfig[]) => void`
- `sortConfigs`: 현재 정렬 설정 배열 (다중 정렬)
- `toggleSort(key, event)`: Shift 키 여부에 따라 단일/다중 정렬 토글

### useCheckbox

- 파라미터: `getFilteredRows`, `getAllRows`, `onCheckedChange`
- `checkedIds`: 체크된 row id Set, `isAllChecked`, `isRowChecked(id)`
- `toggleAll()` / `toggleRow(id)`: 전체/개별 토글

### useValidation

- 파라미터: `getRows`, `getColumns`
- `errors`: `Record<"rowId_colKey", errorMsg>` reactive 맵
- `validateCell(row, col, value)`: 단일 셀 검증 후 errors 갱신

### useColumnSettings

- 파라미터: `getColumns`
- `hiddenColKeys`: 숨긴 컬럼 key 배열, `visibleColumns`: 표시 컬럼 computed
- `toggleColVisibility(key)`, `colSettingsOpen`: 드롭다운 열림 상태

### useColumnDrag

- 파라미터: `getVisibleColumns`, `onReorder`, `getIsResizing?`
- `onDragStart(colIdx, e)`: 리사이즈 중이면 `e.preventDefault()`로 차단
- `dragSourceColIdx` / `dragOverColIdx`: 드래그 UI 표시용 인덱스

### useRowDragDrop

- 파라미터: `getRow`, `onReorder`
- `rowDragSrcIdx` / `rowDragOverIdx` / `rowDragOverPos`: 드래그 UI 상태
- `onRowDrop`: 드롭 시 `onReorder(from, to, position)` 호출

### useTree

- 파라미터: `getRows`, `getEnabled`, `getChildrenKey`, `getFilteredIds`
- `flatTreeItems`: 토글/필터 상태를 반영한 평탄화된 `DataItem[]`
- `toggleNode(id)`: 노드 접기/펼치기 토글
- `isExpanded(id)`: 해당 노드의 펼침 여부
- `expandAll()` / `collapseAll()`: 전체 펼치기 / 전체 접기
- `getFilteredIds`: `null`이면 필터 없음, `Set<any>`이면 표시할 노드 ID 집합 (일치 노드 + 모든 상위 노드)

---

## 30. 트리 구조 (Tree Grid)

계층적 데이터를 인덴트 + 토글 버튼으로 표현합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="treeRows"
  :useTree="true"
  treeKey="name"
  :useFilter="true"
  :showFooter="true"
/>
```

**`rows` 데이터 구조:**

```ts
const treeRows = [
  {
    id: 1, name: 'CEO', dept: '경영', salary: 200000,
    children: [
      {
        id: 2, name: '개발팀장', dept: '개발', salary: 120000,
        children: [
          { id: 3, name: '개발자A', dept: '개발', salary: 80000 },
        ]
      }
    ]
  }
]
```

**주요 Props:**

| Prop | 타입 | 기본값 | 설명 |
|:-----|:-----|:------:|:-----|
| `useTree` | `boolean` | `false` | 트리 모드 활성화 |
| `treeKey` | `string` | `''` | 인덴트·토글 버튼 표시 컬럼 key (미지정 시 첫 번째 컬럼) |
| `childrenKey` | `string` | `'children'` | 자식 행 배열 필드명 |

- 툴바에 **전체 펼치기 / 전체 접기** 버튼이 자동으로 추가됩니다.
- `useFilter`와 함께 사용 시 — 일치하는 노드 + 모든 상위 노드가 표시됩니다.
- `useTree` 활성화 시 `groupBy`는 자동으로 무시됩니다.
- 가상 스크롤, 푸터 집계, 페이징과 함께 사용 가능합니다.

---

## 31. 푸터 집계 행

`showFooter="true"` 설정 시 그리드 하단에 집계 행이 고정 표시됩니다.
각 컬럼의 `footer` 필드로 집계 방식을 지정합니다.

> 푸터 행은 스크롤 컨테이너 외부에 독립적으로 렌더링되며, 본문 수평 스크롤 시 자동으로 동기화됩니다.

```ts
const columns = [
  { key: 'name',   title: '이름' },
  { key: 'salary', title: '급여', type: 'number', footer: 'sum', footerLabel: '합계' },
  { key: 'active', title: '재직', type: 'boolean', footer: 'count', footerLabel: '재직' },
  { key: 'score',  title: '점수', type: 'number', footer: 'avg', footerLabel: '평균' },
  // 커스텀 집계 함수
  { key: 'bonus',  title: '보너스', footer: (rows) => rows.reduce((s, r) => s + (r.bonus ?? 0), 0) },
]
```

```vue
<WZGrid :columns="columns" :rows="rows" :showFooter="true" />
```

**`FooterAggr` 타입:**

| 값 | 설명 |
|:---|:-----|
| `'sum'` | 숫자 합계 |
| `'avg'` | 숫자 평균 (소수점 2자리) |
| `'count'` | `null` / `undefined` / `false` / `''` 가 아닌 값의 수 |
| `'min'` | 최솟값 |
| `'max'` | 최댓값 |
| `(rows) => any` | 커스텀 집계 함수 |

- `footerLabel`을 지정하면 집계값 앞에 레이블이 표시됩니다 (예: `합계 1,234,000`).
- 푸터는 **필터링된 rows** 기준으로 계산됩니다 (전체 rows 아님).
- 그리드 하단에 `sticky bottom-0`으로 고정됩니다.

---

## 26. Excel 내보내기

툴바에 Excel 내보내기 버튼을 추가합니다. 버튼 클릭 시 현재 그리드 데이터를 `.xlsx` 파일로 저장합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :show-excel-export="true"
  excel-filename="report.xlsx"
  :use-checkbox="true"
/>
```

| Prop | 설명 |
|------|------|
| `showExcelExport` | `true` 시 툴바에 Excel 버튼 표시 |
| `excelFilename` | 저장 파일명 (기본: `export.xlsx`) |

- `useCheckbox: true` + 체크된 행이 있을 경우 → 체크된 행만 내보냅니다.
- `image`, `button` 타입 컬럼은 자동으로 제외됩니다.
- `select`, `badge`, `radio` 타입은 `options`의 `label` 값으로 변환됩니다.
- `boolean` 타입은 `✓` / `✗` 문자로 출력됩니다.
- `progress` 타입은 숫자(0~100)로 출력되며 셀 포맷 `0"%"`가 적용됩니다. Excel에서 `75%` 형태로 표시되고, ExcelJS를 통해 data bar 조건부 서식도 자동 적용됩니다.

---

## 32. 셀 커스텀 렌더러 (Custom Cell Renderer)

`#cell-{colKey}` 스코프드 슬롯을 사용하면 특정 컬럼의 셀 내용을 자유롭게 커스터마이즈할 수 있습니다.

### 슬롯 이름 규칙

슬롯 이름은 `cell-` 접두어 + 컬럼의 `key` 값입니다.

| 컬럼 key | 슬롯 이름 |
|:---------|:---------|
| `name` | `#cell-name` |
| `status` | `#cell-status` |
| `salary` | `#cell-salary` |

### 슬롯 스코프 데이터

| 속성 | 타입 | 설명 |
|:-----|:-----|:-----|
| `row` | `any` | 현재 행 객체 전체 |
| `column` | `Column` | 현재 컬럼 정의 |
| `value` | `any` | 현재 셀 값 (`row[column.key]`) |
| `rowIndex` | `number` | 현재 행의 인덱스 |

### 사용 예시

```vue
<WZGrid :columns="columns" :rows="rows">
  <!-- 이름 컬럼: 아바타 + 볼드 텍스트 -->
  <template #cell-name="{ row, value }">
    <div class="flex items-center gap-2">
      <img :src="row.avatar" class="w-6 h-6 rounded-full" />
      <span class="font-bold">{{ value }}</span>
    </div>
  </template>

  <!-- 상태 컬럼: 조건부 색상 -->
  <template #cell-status="{ value }">
    <span :class="value === 'Active' ? 'text-green-600' : 'text-red-600'">
      {{ value }}
    </span>
  </template>

  <!-- 급여 컬럼: 통화 포맷 + 아이콘 -->
  <template #cell-salary="{ value }">
    <div class="flex items-center gap-1">
      <span>&#8361;</span>
      <span>{{ Number(value).toLocaleString() }}</span>
    </div>
  </template>
</WZGrid>
```

### 주의사항

- **편집 모드**: 셀이 편집 모드일 때는 커스텀 슬롯이 아닌 기존 편집 UI(input/select)가 표시됩니다.
- **트리 모드**: 트리 컬럼(`treeKey`)에 커스텀 슬롯을 사용해도 접기/펼치기 토글 버튼은 독립적으로 유지됩니다.
- **기존 타입과의 관계**: 슬롯이 제공되면 해당 컬럼의 `type`에 의한 기본 렌더링(badge, progress 등)은 무시됩니다.

---

## 32-1. 로딩 / 빈 상태 슬롯

서버사이드 조회나 비동기 로드 시 **로딩 오버레이**와 **빈 상태 화면**을 간단히 표시할 수 있습니다.

### 관련 Props

| Prop | 타입 | 기본값 | 설명 |
|:-----|:-----|:-------|:-----|
| `loading` | `boolean` | `false` | `true`이면 그리드 위에 로딩 오버레이가 표시됩니다. 컨테이너/테이블에 `aria-busy="true"`가 자동 적용됩니다. |
| `loadingRowCount` | `number` | `5` | 기본 스켈레톤에서 렌더할 펄스 라인 수 |
| `emptyText` | `string` | `undefined` | 데이터가 없을 때 기본으로 표시할 문자열. 미지정 시 i18n `aria.empty` 메시지를 사용합니다. |

### `#loading` 슬롯

`loading === true`이면서 슬롯이 제공되면 기본 스켈레톤 대신 커스텀 로딩 UI를 표시합니다.

```vue
<WZGrid :columns="columns" :rows="rows" :loading="isFetching">
  <template #loading>
    <div class="flex items-center gap-2 text-sm text-gray-500">
      <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><!-- spinner --></svg>
      불러오는 중...
    </div>
  </template>
</WZGrid>
```

### `#empty` 슬롯

`loading === false`이고 표시할 행이 0개이면 빈 상태 슬롯이 렌더됩니다.

```vue
<WZGrid :columns="columns" :rows="rows" :loading="isFetching">
  <template #empty>
    <div class="text-center py-8">
      <div class="text-gray-400 mb-2">조건에 맞는 데이터가 없습니다.</div>
      <button class="text-blue-500 text-sm" @click="reload">새로고침</button>
    </div>
  </template>
</WZGrid>
```

### 동작 규칙

- 로딩과 빈 상태는 동시에 렌더되지 않습니다. `loading`이 `true`이면 빈 상태는 표시되지 않습니다.
- `aria-busy`는 `loading` 동안 컨테이너와 테이블 모두에 부여되어 스크린 리더가 사용자에게 상태 변화를 알릴 수 있습니다.
- 빈 상태 기본 텍스트는 `emptyText` prop이 우선되고, 없으면 i18n 메시지(`aria.empty`, 기본: "표시할 데이터가 없습니다.")가 사용됩니다.

---

## 32-2. 제어 상태 (v-model)

부모 컴포넌트 또는 외부 스토어(Pinia/Vuex)에서 페이지·체크·필터·정렬 상태를 완전히 제어할 수 있도록 `v-model` 패턴을 제공합니다.

### 지원 목록

| v-model | 프롭 | Emit | 기본 내부 상태 | 도입 버전 |
|:--|:--|:--|:--|:--|
| `v-model:currentPage` | `currentPage: number` | `update:currentPage` | `1` | 1.0 |
| `v-model:pageSize`    | `pageSize: number`    | `update:pageSize`    | `20` | 1.0 |
| `v-model:checkedIds`  | `checkedIds: (string\|number)[]` | `update:checkedIds`  | `[]` | **1.5** |
| `v-model:filters`     | `filters: Record<string, any>` | `update:filters` | `{}` | **1.5** |
| `v-model:sort`        | `sort: SortConfig[]`  | `update:sort`        | `[]` | **1.5** |

### 제어 vs 비제어

해당 prop이 `undefined`이면 WZGrid가 **내부 상태(ref)**를 관리합니다. prop을 명시하면 그 값이 소스 오브 트루스가 되고, 부모 쪽에서 상태가 유지됩니다. 한 번이라도 prop을 제공한 이후에는 `undefined`로 되돌리지 않는 것을 권장합니다(부모에서 `ref()` 유지).

### 하위 호환

- `@update:checked` (행 **객체** 배열)는 그대로 유지됩니다. 추가로 `update:checkedIds`(id 배열)가 함께 emit됩니다.
- `@sort` (SortConfig[])는 그대로 유지됩니다. 추가로 `update:sort`가 함께 emit됩니다.
- `@update:filters`는 서버사이드 모드에서 기존과 동일하게 **활성 키만** 담은 payload를 emit하며, v-model 제어 모드(클라이언트)에서는 **전체 스냅샷**을 emit합니다.

자세한 사용 예시는 [제어 상태 가이드](docs/guide/controlled-state.md)를 참고하세요.

---

## 32-3. 상호배제 매트릭스

다음 prop 조합은 서로 상호배제이거나 성능/기능상 주의가 필요합니다. 개발 모드(`import.meta.env.DEV`)에서 WZGrid는 조합 감지 시 `console.warn`으로 안내합니다.

| 조합 | 동작 | 권장 대응 |
|:--|:--|:--|
| `useTree=true` + `groupBy` 지정 | `groupBy`가 무시됩니다 (`useGrouping`이 no-op 처리) | 둘 중 하나만 사용 |
| `useServerSide=true` + `useTree=true` | 트리 구조에 대한 서버사이드 지원 미완 | 클라이언트 사이드 트리 사용 또는 서버에서 평면화 |
| `autoMergeCols`/`mergeCells` + `rows.length > 1000` | 병합 활성화 시 가상 스크롤이 비활성화되어 대량 데이터에서 프레임 드랍 | 서버사이드 페이징 또는 병합 범위 최소화 |

::: tip 경고 1회성
각 조합에 대한 경고는 세션당 1회만 출력됩니다. 빌드(prod) 번들에서는 `import.meta.env.DEV` 가드로 완전히 제거됩니다.
:::

---

## 33. 행 클릭 & 행/셀 스타일

### `@click:row` 이벤트

데이터 행을 클릭하면 `@click:row` 이벤트가 발생합니다.

```vue
<WZGrid :columns="columns" :rows="rows" @click:row="handleRowClick" />
```

```ts
const handleRowClick = ({ rowIdx, row }: { rowIdx: number; row: any }) => {
  console.log('클릭된 행:', row.id, '인덱스:', rowIdx);
};
```

### `rowClass` — 행 동적 스타일

함수를 전달하여 행(tr)에 동적으로 CSS 클래스를 적용합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :rowClass="(row, rowIndex) => ({
    'bg-red-50': row.status === 'Inactive',
    'bg-green-50': row.status === 'Active',
    'font-bold': rowIndex === 0,
  })"
/>
```

반환값은 Vue의 `:class` 바인딩과 동일한 형식을 지원합니다:
- 문자열: `'bg-red-50 font-bold'`
- 배열: `['bg-red-50', 'font-bold']`
- 객체: `{ 'bg-red-50': true, 'font-bold': false }`

### `cellClass` — 셀 동적 스타일

함수를 전달하여 셀(td)에 동적으로 CSS 클래스를 적용합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :cellClass="(row, column, rowIndex) => {
    if (column.key === 'salary' && row.salary > 100000) return 'bg-yellow-50 font-bold';
    return null;
  }"
/>
```

---

## 34. 서버사이드 모드

`serverSide` prop을 `true`로 설정하면 정렬, 필터링, 페이징을 클라이언트에서 처리하지 않고 이벤트를 통해 서버에 위임합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="currentPageRows"
  :serverSide="true"
  :totalRows="serverTotalCount"
  :usePaging="true"
  :useFilter="true"
  v-model:currentPage="currentPage"
  v-model:pageSize="pageSize"
  @sort="handleServerSort"
  @update:filters="handleServerFilter"
  @update:currentPage="fetchData"
  @update:pageSize="fetchData"
/>
```

### 동작 방식

| 기능 | 클라이언트 모드 (기본) | 서버사이드 모드 |
|:-----|:----------------------|:---------------|
| 필터링 | `useFilter`로 클라이언트에서 필터 | 필터 UI 유지, `@update:filters` 이벤트 emit |
| 정렬 | `@sort` 이벤트로 클라이언트 처리 | `@sort` 이벤트로 서버에 위임 (동일) |
| 페이징 | `activeItems`를 슬라이싱 | `rows`를 현재 페이지 데이터로 직접 사용 |
| 전체 행 수 | `rows.length`에서 자동 계산 | `totalRows` prop으로 전달 |

### `@update:filters` 이벤트 페이로드

활성화된 필터만 포함하는 객체입니다.

```ts
// 예시 페이로드
{
  name: { value: '홍' },                    // 텍스트 필터
  salary: { min: '30000', max: '80000' },   // 숫자 범위 필터
  joinDate: { from: '2024-01-01', to: '2024-12-31' }, // 날짜 범위 필터
  dept: { values: ['dev', 'hr'] },          // 다중 선택 필터
}
```

### 서버사이드 사용 예시

```ts
const currentPage = ref(1);
const pageSize = ref(20);
const currentPageRows = ref<any[]>([]);
const serverTotalCount = ref(0);

const fetchData = async () => {
  const res = await fetch(`/api/employees?page=${currentPage.value}&size=${pageSize.value}`);
  const data = await res.json();
  currentPageRows.value = data.items;
  serverTotalCount.value = data.total;
};

const handleServerSort = (configs: SortConfig[]) => {
  // 서버에 정렬 파라미터 전달 후 fetchData
  fetchData();
};

const handleServerFilter = (filters: Record<string, any>) => {
  // 서버에 필터 파라미터 전달 후 fetchData
  currentPage.value = 1;
  fetchData();
};
```

### 주의사항

- 서버사이드 모드에서 `rows`는 **현재 페이지의 데이터만** 전달해야 합니다.
- `totalRows`를 반드시 설정해야 페이징 UI가 올바르게 표시됩니다.
- 트리 모드(`useTree`)와 그룹핑(`groupBy`)은 서버사이드 모드와 함께 사용하지 않는 것을 권장합니다.

---

## 35. 마스터-디테일 Row Expand

`#detail` 스코프드 슬롯을 제공하면 각 행에 확장/축소 토글 버튼이 나타납니다. 행을 확장하면 해당 행 아래에 디테일 영역이 표시됩니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
>
  <template #detail="{ row, rowIndex }">
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span class="font-bold">상세 정보</span>
        <p>이름: {{ row.name }}</p>
        <p>부서: {{ row.dept }}</p>
      </div>
      <div>
        <span class="font-bold">이력</span>
        <p>입사일: {{ row.joinDate }}</p>
        <p>급여: {{ row.salary?.toLocaleString() }}원</p>
      </div>
    </div>
  </template>
</WZGrid>
```

### 슬롯 스코프 데이터

| 속성 | 타입 | 설명 |
|:-----|:-----|:-----|
| `row` | `any` | 현재 행 객체 |
| `rowIndex` | `number` | 현재 행의 인덱스 |

### 동작

- `#detail` 슬롯이 제공되면 각 데이터 행 왼쪽에 화살표(▶) 토글 버튼이 자동으로 표시됩니다.
- 버튼 클릭 시 행이 확장되어 디테일 영역이 나타나고, 다시 클릭하면 축소됩니다.
- 확장된 행의 화살표는 90도 회전(▼)하여 확장 상태를 표시합니다.
- 디테일 영역은 전체 컬럼 너비를 차지합니다.
- 여러 행을 동시에 확장할 수 있습니다.

### 주의사항

- `#detail` 슬롯을 제공하지 않으면 확장 버튼이 표시되지 않습니다.
- 가상 스크롤, 페이징, 체크박스 등 기존 기능과 함께 사용 가능합니다.

---

## 36. VitePress 라이브 데모

VitePress 가이드 문서 각 페이지에는 `<ClientOnly>` 래퍼로 감싼 인터랙티브 데모 컴포넌트가 삽입되어 있습니다. 데모 컴포넌트는 `docs/.vitepress/components/demos/`에 위치하며 `docs/.vitepress/theme/index.ts`에서 전역 등록됩니다.

| 가이드 페이지 | 데모 컴포넌트 | 위치 |
| :--- | :--- | :--- |
| `guide/getting-started.md` | `DemoGettingStarted` | "라이브 데모" — 기본 예제 앞 |
| `guide/tree.md` | `DemoTree` | "라이브 데모" — 기본 사용 앞 |
| `guide/merge.md` | `DemoMerge` | "라이브 데모" — 자동 병합 앞 |
| `guide/master-detail.md` | `DemoMasterDetail` | "라이브 데모" — 기본 사용법 앞 |
| `guide/editing.md` | `DemoEditing` | "라이브 데모" — 셀 편집 앞 |
| `guide/column-types.md` | `DemoColumnTypes` | "라이브 데모" — 편집 가능 여부 요약 앞 |
| `guide/cell-slot.md` | `DemoCellSlot` | "라이브 데모" — 슬롯 이름 규칙 앞 |
| `guide/footer.md` | `DemoFooter` | "라이브 데모" — 기본 사용 앞 |
| `guide/selection.md` | `DemoSelection` | "라이브 데모" — 셀 선택 앞 |
| `guide/row-style.md` | `DemoRowStyle` | "라이브 데모" — @click:row 이벤트 앞 |
| `guide/advanced-filter.md` | `DemoAdvancedFilter` | "라이브 데모" — 컬럼 타입별 필터 UI 앞 |
| `guide/columns.md` | `DemoColumns` | "라이브 데모" — 컬럼 고정 앞 |
| `guide/sort-filter.md` | `DemoSortFilter` | "라이브 데모" — 정렬 앞 |
| `guide/paging.md` | `DemoPaging` | "라이브 데모" — 페이징 앞 |
| `guide/grouping.md` | `DemoGrouping` | "라이브 데모" — 그룹핑 앞 |
| `guide/context-menu.md` | `DemoContextMenu` | "라이브 데모" — 메뉴 항목 앞 |
| `guide/export.md` | `DemoExport` | "라이브 데모" — 인쇄(Print) 앞 |

---

*최종 업데이트: 2026-04-17 — Phase 4.3 (Undo/Redo 편집 히스토리): `useUndoRedo` composable 신규 추가 — LIFO undo/redo 스택, 분기 변경 시 redo 자동 비움, `maxDepth` FIFO drain. WZGrid에 `useUndo`/`maxUndoDepth` props 추가, `Ctrl+Z`/`Cmd+Z`는 Undo, `Ctrl+Y`/`Ctrl+Shift+Z`/`Cmd+Shift+Z`는 Redo로 바인딩. 단방향 데이터 흐름 유지를 위해 Undo/Redo 재생 시 `rows`를 직접 mutate 하지 않고 `@update:cell` 이벤트를 역/재 값으로 재 emit — 부모 핸들러 하나로 편집/언두/리두 모두 처리. `@undo`/`@redo` 선택적 이벤트(HistoryEntry 페이로드) 신규 emit. `CellUpdateEvent<T>` 타입에 `rowIdx`·`colKey`·`oldValue` 공식화, 기존 `key` 필드는 `colKey`의 하위 호환 별칭으로 유지. `useUndoRedo` export, `tests/composables/useUndoRedo.spec.ts` 8종 테스트 추가 (총 62 테스트 통과).*

*이전 업데이트: 2026-04-17 — Phase 4.2 (CSV 안전 내보내기): `src/utils/csv.ts` 신규 — `exportCSV` / `toCSV` / `escapeCSVField` export. **CSV injection(수식 주입) 방어** 기본 탑재: `=`/`+`/`-`/`@`/`\t`/`\r`로 시작하는 셀 값 앞에 `'` 자동 prepend (OWASP 권장). RFC 4180 준수(따옴표·구분자·개행 quoting), UTF-8 BOM 기본 포함, `Date` ISO 자동 변환, 객체 JSON 직렬화. `Column<T>`·`GridRow<T>` 제네릭 전파 및 `transformCell` 훅으로 값 가공 지원. 툴바 CSV 내보내기 버튼(`useCsvExport`/`csvFilename`/`csvDelimiter` props), `useCheckbox` + 체크된 행 있으면 선택 항목만 export. `tests/utils/csv.spec.ts` 19종 테스트 추가 (총 54 테스트 통과). 기존 `downloadCSV`는 내부적으로 `exportCSV`에 위임(하위 호환 + deprecated). i18n `toolbar.csvExport` 키 추가(ko/en), `docs/guide/export.md`의 CSV 섹션 전면 개편.*

*이전 업데이트: 2026-04-17 — Phase 4.1 (`Column<T>` 제네릭 전파): `validator`/`onInput` 시그니처를 `(value: ColumnCellValue<T>, row: GridRow<T>) => ...`로 강화, `footer` 커스텀 함수의 인자를 `GridRow<T>[]`로 고정(`FooterAggr<T>` 제네릭화), `CellUpdateEvent<T>`·`CellSlotProps<T>`의 `value`/`oldValue` 타입을 `ColumnCellValue<T>`로 연결, `DataItem<T>`·`GridItem<T>` 제네릭화, 새 헬퍼 타입 `ColumnCellValue<T>` 추가 및 export. 하위 호환은 기본값 `T = Record<string, any>`로 유지 — 기존 `Column`/`GridRow`/`CellUpdateEvent` 등 제네릭 없이 사용하던 코드는 그대로 동작. `tests/types/column-generics.ts` 타입 레벨 회귀 파일 추가, `docs/guide/typescript.md`에 validator/onInput/footer/CellSlotProps/ColumnCellValue 섹션 보강.*

*이전 업데이트: 2026-04-17 — Phase 3 (a11y/UX): `useFocusTrap` composable 신규 추가 — Tab/Shift+Tab 순환, Esc 콜백, 해제 시 이전 포커스 복귀, 4종 단위 테스트(총 35 테스트 통과); `WZContextMenu`에 `role="menu"`/`menuitem`/`separator` + `aria-label` + focus trap 적용, Esc 및 외부 클릭 시 닫힘 + 호출자 포커스 복귀; 키보드 단축키 확장(`Home`/`End`/`Ctrl+Home`/`Ctrl+End`/`PageUp`/`PageDown`) — 그룹 헤더/소계 자동 스킵; `date`·`datetime` 필터에 **오늘 / 최근 7일 / 이번 달** 프리셋 버튼 추가(i18n `datePreset.*`), `i18n.aria.contextMenu` 키 추가; `#empty-actions` 슬롯 신규 — 빈 상태에서 CTA 버튼(새로고침·필터 초기화) 렌더; `useFocusTrap` export 추가(`src/index.ts`); `docs/guide/accessibility.md`·`docs/guide/ux-tips.md` 가이드 신규 생성 및 사이드바 등록.*

*이전 업데이트: 2026-04-17 — Phase 2.3/2.4: Vitest + jsdom 테스트 프레임워크 도입, `tests/composables/*.spec.ts`에 `useSort`/`useFilter`/`useMerge`/`useTree`/`useGrouping` 단위 테스트 31종 추가, `package.json`에 `test`/`test:watch`/`test:coverage`/`typecheck` 스크립트 추가, `docs/guide/testing.md` 가이드 신규 생성 및 사이드바 등록, `.github/workflows/ci.yml`에 typecheck→test→build 파이프라인 추가(Node 20, dist artifact 업로드).*

*이전 업데이트: 2026-04-16 — Phase 2.1/2.2: `v-model:checkedIds`/`v-model:filters`/`v-model:sort` 양방향 바인딩 지원(제어 모드), 하위 호환으로 기존 `@update:checked`(행 객체 배열)·`@sort` 이벤트 유지, 개발 모드(`import.meta.env.DEV`) 상호배제 경고 추가(useTree+groupBy / useServerSide+useTree / 병합+대량 데이터), `controlled-state.md` 가이드 신규 생성 및 사이드바 등록, `update:checkedIds`/`update:sort` 이벤트 문서화.*

*이전 업데이트: 2026-04-16 — Phase 1 안정화: 서버사이드 필터 debounce(+ IME 한글 조합 보호) 및 `filterDebounceMs` prop 추가, `loading`/`loadingRowCount`/`emptyText` prop 및 `#loading`/`#empty` 슬롯 추가, 체크박스·드래그·디테일·트리 토글 `aria-label`/`role` 보강, 컨텍스트 메뉴 좌표 음수 방지 클램프, `useMerge` 병합 범위 경계 클램프, `SortChangeEvent`/`FilterChangeEvent`/`SelectionChangeEvent`/`PagingChangeEvent`/`CheckedChangeEvent`/`CellSlotProps`/`DetailSlotProps` 타입 export.*

*이전 업데이트: 2026-03-31 — exceljs를 peerDependencies(optional)에서 dependencies로 이동. wz-grid 설치 시 자동으로 함께 설치됨.*

*이전 업데이트: 2026-03-24 — WZGrid v1.4.0 릴리즈. `textarea` 컬럼 타입을 확장 가능한 플로팅 팝업 스타일로 대폭 개선(`Enter` 셀 내 줄바꿈 및 `Ctrl+Enter` 저장 로직 추가, 취소/확인 버튼 패널 도입).*
*이전 업데이트: 2026-03-19 — sparkline 컬럼 타입에 `sparklineType` 옵션 추가 (`'line' | 'area' | 'bar' | 'column'`, 기본값 `'line'`): line(polyline), area(polygon), bar(수평 rect), column(수직 rect) 4종 차트 스타일 지원.*

*이전 업데이트: 2026-03-18 — i18n 지원 추가 (`locale`, `messages` prop, 7개 네임스페이스, `useI18n`/`I18N_KEY`); 플러그인 시스템 추가 (`plugins` prop, `WZGridPlugin`·`PluginContext`·`PluginHookData` 타입, `afterSort`/`afterFilter`/`beforeRender`/`cellRender` 훅, 에러 격리); 성능 모니터링 추가 (`performance` prop, `@perf` 이벤트, `PerfEntry` 타입); VitePress 가이드 3개 신규 생성: `i18n.md`, `plugins.md`, `performance-monitoring.md`; 사이드바 등록.*

*이전 업데이트: 2026-03-18 — VitePress 가이드 3개 신규 생성: `performance.md`(가상 스크롤 vs 페이징, 병합 주의사항, 10K+ 권장 설정, serverSide 활용), `anti-patterns.md`(rows id 누락, 직접 변경, 병합+대량 데이터, select options 누락 등 8가지 패턴), `composables-usage.md`(8개 composable 실전 활용, 외부 상태 제어, 파이프라인 조합); 사이드바 "고급" 섹션에 3개 페이지 등록.*

*이전 업데이트: 2026-03-18 — TypeScript 제네릭 타입(`GridRow<T>`, `Column<T>`, `CellUpdateEvent<T>`) 섹션 추가; 공개 composable 8개 목록 표기 (useSort, useFilter, useTree, useCheckbox, useValidation, useSelection, useClipboard, useVirtualScroll); VitePress 가이드 `typescript.md` 신규 생성, API `composables.md` 신규 생성 및 사이드바 등록.*

*이전 업데이트: 2026-03-18 — `debug` prop 추가 (rows id 누락·컬럼 key 불일치·select options 미지정 감지); deprecated props (`showColumnSettings`→`useColumnSettings`, `showExcelExport`→`useExcelExport`, `serverSide`→`useServerSide`) 콘솔 경고 설명 추가; VitePress 가이드 `migration.md`·`debugging.md` 신규 생성 및 사이드바 등록; `docs/api/props.md`에 `debug` prop 및 deprecated prop 대체 목록 추가.*

*이전 업데이트: 2026-03-17 — 라이선스 시스템 제거, 전 기능 오픈소스 공개: `licenseKey` prop 제거, `eff*` computed에서 Pro 게이팅 제거, WZGridRow `isProLicense` prop 제거, sparkline 🔒 제거, Pro 모달 제거, `src/license.ts` 및 `src/demos/shared/useLicense.ts` 삭제; `textarea` 컬럼 타입 추가 (멀티라인 편집, Enter 다음 행 이동, Shift+Enter 줄바꿈); 편집 중 Enter 키로 동일 컬럼 다음 행 이동(Excel 동작) 추가; docs/pricing.md·guide/introduction.md에서 Pro/Enterprise 티어 관련 내용 제거 (MIT 오픈소스 전환 반영); 엑셀 내보내기 라이브러리를 SheetJS(xlsx)에서 ExcelJS로 마이그레이션 — peerDependency 변경, progress 컬럼 data bar 조건부 서식 정상 지원; VitePress 가이드 페이지 7개에 인터랙티브 라이브 데모 컴포넌트 삽입 (DemoGettingStarted, DemoTree, DemoMerge, DemoMasterDetail, DemoEditing, DemoColumnTypes, DemoCellSlot); Phase 2 가이드 페이지 6개에 추가 데모 삽입 (DemoFooter, DemoSelection, DemoRowStyle, DemoAdvancedFilter, DemoColumns, DemoSortFilter); Phase 3 가이드 페이지 4개에 추가 데모 삽입 (DemoPaging, DemoGrouping, DemoContextMenu, DemoExport)*
