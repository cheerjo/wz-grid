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
26. [종합 예제](#26-종합-예제)
27. [내부 구조 (Architecture)](#27-내부-구조-architecture)

---

## 1. 빠른 시작

```vue
<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from './components/WZGrid.vue';
import type { Column } from './types/grid';

const columns = ref<Column[]>([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150 },
  { key: 'age',  title: '나이', width: 80, type: 'number', align: 'right' },
]);

const rows = ref([
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

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `columns` | `Column[]` | — | **(필수)** 컬럼 정의 배열 |
| `rows` | `any[]` | — | **(필수)** 행 데이터 배열. 각 객체는 `id` 필드 필요 |
| `height` | `number` | `500` | 그리드 전체 높이(px) |
| `rowHeight` | `number` | `40` | 각 행의 높이(px). 가상 스크롤 계산에 사용 |
| `usePaging` | `boolean` | `false` | 페이징 활성화 여부 |
| `pageSize` | `number` | `20` | 페이지당 표시 행 수 (`v-model:pageSize` 지원) |
| `currentPage` | `number` | `1` | 현재 페이지 번호 (`v-model:currentPage` 지원) |
| `useCheckbox` | `boolean` | `false` | 첫 번째 컬럼에 체크박스 활성화 여부 |
| `showAdd` | `boolean` | `false` | 툴바에 기본 추가 버튼 표시 여부 |
| `showDelete` | `boolean` | `false` | 툴바에 기본 삭제 버튼 표시 여부 |
| `useFilter` | `boolean` | `false` | 컬럼별 필터 입력 행 표시 여부 |
| `showColumnSettings` | `boolean` | `false` | 헤더 우측 컬럼 표시/숨기기 설정 버튼 표시 |
| `groupBy` | `string` | `''` | 그룹핑 기준 컬럼 key. 빈 문자열이면 그룹핑 없음 |
| `useContextMenu` | `boolean` | `false` | 우클릭 컨텍스트 메뉴 사용 여부 |
| `useRowDrag` | `boolean` | `false` | 행 드래그 핸들 표시 및 재배치 기능 활성화 |
| `autoMergeCols` | `string[]` | `[]` | 인접한 동일 값 셀을 자동 병합할 컬럼 key 목록 |
| `mergeCells` | `MergeCell[]` | `[]` | 수동으로 정의한 셀 병합 규칙 목록 |

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
}

interface Option {
  label: string;
  value?: any;    // button 타입 등 value가 필요 없는 경우 생략 가능
  color?: string; // badge 타입에서 Tailwind 클래스 지정
}

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select'
                | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio';

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

---

## 5. Events

| 이벤트 | 페이로드 | 설명 |
| :--- | :--- | :--- |
| `@update:cell` | `{ rowIdx, row, colKey, value }` | 셀 값이 변경될 때 발생 |
| `@update:currentPage` | `number` | 페이지 변경 (`v-model` 사용 권장) |
| `@update:pageSize` | `number` | 페이지 크기 변경 (`v-model` 사용 권장) |
| `@update:checked` | `any[]` | 체크된 행 배열 변경 |
| `@update:sort` | `SortConfig[]` | 헤더 클릭으로 정렬 변경 시 발생. 다중 정렬 배열 |
| `@update:resize` | `{ key: string, width: number }` | 컬럼 너비 드래그 조절 완료 시 발생 |
| `@update:reorder-columns` | `Column[]` | 컬럼 드래그 재배치 후 새 컬럼 순서 배열 |
| `@update:reorder-rows` | `any[]` | 행 드래그 재배치 후 새 행 순서 배열 |
| `@insert:row` | — | 행 추가 요청 (showAdd 또는 컨텍스트 메뉴) |
| `@delete:rows` | `number[]` | 행 삭제 요청 (선택된 행 인덱스 배열) |
| `@click:button` | `{ rowIdx, row, colKey }` | `button` 타입 셀 클릭 시 발생 |

### `@update:cell` 처리 예제

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
```

### `@update:sort` 처리 예제

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

### `@update:resize` 처리 예제

```ts
const handleResize = ({ key, width }: { key: string; width: number }) => {
  const col = columns.value.find(c => c.key === key);
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

헤더 셀 클릭으로 정렬 이벤트를 발생시킵니다. **실제 정렬 로직은 부모 컴포넌트에서 처리합니다.**

### 단일 정렬

헤더 클릭 시 오름차순(▲) ↔ 내림차순(▼) 토글. 다시 클릭하면 정렬 해제.

### 다중 정렬 (Multi-Sort)

`Shift + 헤더 클릭`으로 여러 컬럼을 동시에 정렬합니다.

- 정렬된 컬럼 헤더에 순서 번호(①②③…)와 방향 화살표 표시
- 이미 정렬 중인 컬럼을 Shift+클릭하면 방향 토글 → 해제 순으로 변경

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

```vue
<WZGrid ... @update:sort="handleSort" />
```

---

## 9. 필터 (Filter)

`useFilter` prop을 `true`로 설정하면 헤더 아래에 컬럼별 텍스트 입력 필터 행이 나타납니다.

```vue
<WZGrid :useFilter="true" ... />
```

- 각 컬럼 입력창에 텍스트를 입력하면 해당 컬럼 값에 대해 부분 일치 필터링 적용
- 여러 컬럼에 동시에 필터 적용 가능 (AND 조건)
- 필터 결과는 페이징과 연동되며, 필터 변경 시 1페이지로 자동 이동

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
- 드롭 완료 시 `@update:reorder-columns` 이벤트로 새 컬럼 배열 전달

```ts
const handleReorderColumns = (newColumns: Column[]) => {
  columns.value = newColumns;
};
```

```vue
<WZGrid ... @update:reorder-columns="handleReorderColumns" />
```

---

## 12. 행 드래그 재배치

`useRowDrag` prop을 `true`로 설정하면 각 행 좌측에 드래그 핸들(⠿)이 나타납니다.

```vue
<WZGrid :useRowDrag="true" @update:reorder-rows="handleReorderRows" />
```

```ts
const handleReorderRows = (newRows: any[]) => {
  rows.value = newRows;
};
```

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
  @insert:row="handleInsert"
  @delete:rows="handleDelete"
  ...
/>
```

**메뉴 항목:**

| 항목 | 이벤트 | 설명 |
| :--- | :--- | :--- |
| 위에 행 추가 | `@insert:row` | 우클릭한 행 위에 추가 |
| 아래에 행 추가 | `@insert:row` | 우클릭한 행 아래에 추가 |
| 행 삭제 | `@delete:rows` | 우클릭한 행 삭제 |

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
| `Enter` | 선택 셀 편집 모드 진입 |
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
드래그하여 너비를 조절하고, `@update:resize` 이벤트로 결과를 받아 컬럼 정의를 업데이트합니다.

```ts
const handleResize = ({ key, width }: { key: string; width: number }) => {
  const col = columns.value.find(c => c.key === key);
  if (col) col.width = width;
};
```

- 최소 너비: 50px
- 실시간으로 너비 변경 반영

---

## 21. 툴바 (Toolbar)

그리드 우측 상단에 버튼 영역을 제공합니다. 기본 제공 버튼과 커스텀 슬롯을 자유롭게 조합할 수 있습니다.

```vue
<WZGrid
  :showAdd="true"
  :showDelete="true"
  @insert:row="handleInsert"
  @delete:rows="handleDelete"
>
  <template #toolbar>
    <button @click="exportCSV">CSV 내보내기</button>
  </template>
</WZGrid>
```

**기본 제공 버튼:**

| 버튼 | prop | 이벤트 | 비고 |
| :--- | :--- | :--- | :--- |
| 추가 | `showAdd` | `@insert:row` | 항상 활성 |
| 삭제 | `showDelete` | `@delete:rows` | 체크된 행이 없으면 비활성 |

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

`src/utils/tsv.ts`의 `downloadCSV` 유틸 함수를 사용합니다.

```ts
import { downloadCSV } from './utils/tsv';

const exportCSV = () => {
  downloadCSV(rows.value, columns.value, 'export.csv');
};
```

---

## 26. 종합 예제

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

const handleResize = ({ key, width }: any) => {
  const col = columns.value.find(c => c.key === key);
  if (col) col.width = width;
};

const handleReorderColumns = (newCols: Column[]) => {
  columns.value = newCols;
};

const handleReorderRows = (newRows: any[]) => {
  rows.value = newRows;
};

const handleInsert = () => {
  rows.value = [{ id: Date.now(), name: '', status: 'Active', salary: 0, dept: 'dev', completion: 0 }, ...rows.value];
};

const handleDelete = (indices: number[]) => {
  const ids = new Set(indices.map(i => rows.value[i]?.id));
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
    @update:sort="handleSort"
    @update:resize="handleResize"
    @update:reorder-columns="handleReorderColumns"
    @update:reorder-rows="handleReorderRows"
    @update:checked="checkedRows = $event"
    @insert:row="handleInsert"
    @delete:rows="handleDelete"
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

## 27. 내부 구조 (Architecture)

```
src/
├── components/
│   └── WZGrid.vue          # 메인 그리드 컴포넌트
├── composables/
│   ├── useSelection.ts     # 셀 선택 및 범위 선택 로직
│   ├── useClipboard.ts     # 복사/붙여넣기 (TSV 기반)
│   └── useVirtualScroll.ts # 가상 스크롤 엔진
├── types/
│   └── grid.ts             # Column, SortConfig, Selection 등 타입 정의
├── utils/
│   ├── tsv.ts              # TSV 파싱/직렬화, CSV 다운로드
│   └── print.ts            # 인쇄 유틸
└── index.ts                # 컴포넌트 및 타입 export
```

### WZGrid 내부 데이터 흐름

```
props.rows
  → filteredRows      (useFilter 적용)
  → flatGroupedItems  (groupBy 적용: DataItem | GroupHeader | SubtotalItem)
  → pagedItems        (usePaging 적용)
  → visibleRowsRange  (가상 스크롤 적용, 셀 병합 시 전체 렌더링)
```

### GridItem 타입

그룹핑 활성화 시 내부 아이템은 세 가지 타입의 union으로 구성됩니다:

```ts
type DataItem     = { type: 'data'; row: any };
type GroupHeader  = { type: 'group-header'; key: string; label: string; count: number; collapsed: boolean };
type SubtotalItem = { type: 'subtotal'; key: string; count: number; sums: Record<string, number> };
type GridItem     = DataItem | GroupHeader | SubtotalItem;
```

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
- `onPaste(e)`: 클립보드의 TSV 데이터를 파싱하여 시작 셀부터 `updateCell` 호출

---

*최종 업데이트: 2026-03-13 — 다중 정렬, 필터, 컬럼 표시/숨기기, 컬럼/행 드래그 재배치, 그룹핑&소계, 셀 병합, 컨텍스트 메뉴 추가*
