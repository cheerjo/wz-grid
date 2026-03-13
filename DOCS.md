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
9. [셀 선택 & 키보드 단축키](#9-셀-선택--키보드-단축키)
10. [복사 / 붙여넣기 (Excel 연동)](#10-복사--붙여넣기-excel-연동)
11. [데이터 검증 (Validation)](#11-데이터-검증-validation)
12. [컬럼 고정 (Pinned)](#12-컬럼-고정-pinned)
13. [컬럼 리사이즈](#13-컬럼-리사이즈)
14. [CSV 내보내기](#14-csv-내보내기)
15. [종합 예제](#15-종합-예제)
16. [내부 구조 (Architecture)](#16-내부-구조-architecture)

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
| `useCheckbox` | `boolean` | `false` | 첫 번째 컬럼에 체크박스 활성화 여부 |
| `showAdd` | `boolean` | `false` | 툴바에 기본 추가 버튼 표시 여부 |
| `showDelete` | `boolean` | `false` | 툴바에 기본 삭제 버튼 표시 여부 |
| `pageSize` | `number` | `20` | 페이지당 표시 행 수 (`v-model:pageSize` 지원) |
| `currentPage` | `number` | `1` | 현재 페이지 번호 (`v-model:currentPage` 지원) |

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
  truncate?: boolean;  // 내용이 길 때 말줄임표(...) 처리 (기본: true)
  tooltip?: boolean;   // hover 시 전체 내용을 툴팁으로 표시
}

interface Option {
  label: string;
  value?: any;   // button 타입 등 value가 필요 없는 경우 생략 가능
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
| `@update:currentPage` | `number` | 페이지가 변경될 때 발생 (`v-model` 사용 권장) |
| `@update:pageSize` | `number` | 페이지 크기가 변경될 때 발생 (`v-model` 사용 권장) |
| `@sort` | `{ key: string, order: 'asc' \| 'desc' }` | 헤더 클릭으로 정렬 요청 시 발생 |
| `@resize:column` | `{ colIdx: number, width: number }` | 컬럼 너비 드래그 조절 시 발생 |
| `@click:button` | `{ rowIdx, row, colKey }` | `button` 타입 셀 클릭 시 발생 |

### `@update:cell` 처리 예제

```ts
const handleUpdate = ({ row, colKey, value }: any) => {
  // row.id로 원본 배열에서 찾아 갱신
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
```

### `@sort` 처리 예제

```ts
type Row = { id: number; name: string; salary: number };

const handleSort = ({ key, order }: { key: keyof Row; order: 'asc' | 'desc' }) => {
  rows.value.sort((a, b) => {
    const modifier = order === 'asc' ? 1 : -1;
    return (a[key] > b[key] ? 1 : -1) * modifier;
  });
};
```

### `@resize:column` 처리 예제

```ts
const handleResize = ({ colIdx, width }: { colIdx: number; width: number }) => {
  columns.value[colIdx].width = width;
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

**페이징 + 가상 스크롤**: 페이징 활성화 시 현재 페이지 내 행에 대해서만 가상 스크롤이 동작합니다. 두 기능이 동시에 작동하여 최적 성능을 유지합니다.

---

## 7. 가상 스크롤

`useVirtualScroll` 컴포저블이 자동으로 적용됩니다. 별도 설정 없이 동작합니다.

- 현재 viewport에 보이는 행만 실제 DOM으로 렌더링
- 나머지 행은 `paddingTop` / `paddingBottom`으로 공간만 확보
- 기본 버퍼: 상하 각 5행 (보이는 범위 밖 미리 렌더링)
- 10만 건 이상도 끊김 없이 스크롤 가능

`rowHeight` prop이 실제 행 높이와 일치해야 스크롤 계산이 정확합니다.

```vue
<!-- rowHeight는 CSS 높이와 동일하게 맞춰야 함 -->
<WZGrid :rows="rows" :row-height="40" />
```

---

## 8. 정렬 (Sort)

헤더 셀 클릭으로 정렬 이벤트를 발생시킵니다. **실제 정렬 로직은 부모 컴포넌트에서 처리합니다.**

- 같은 컬럼 재클릭 시 오름차순(▲) ↔ 내림차순(▼) 토글
- 현재 정렬 중인 컬럼 헤더에 화살표 표시

```ts
// 정렬 처리 예제
const handleSort = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  rows.value.sort((a, b) => {
    const mod = order === 'asc' ? 1 : -1;
    return (a[key] > b[key] ? 1 : -1) * mod;
  });
};
```

---

## 9. 셀 선택 & 키보드 단축키

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

> 그리드가 포커스를 받아야 키보드 단축키가 동작합니다. 셀 클릭 또는 그리드 영역 클릭 후 사용하세요.

---

## 10. 복사 / 붙여넣기 (Excel 연동)

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

## 11. 데이터 검증 (Validation)

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

```ts
{
  key: 'email', title: '이메일',
  validator: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식이 아닙니다.';
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

// 휴대전화 자동 하이픈 (010-XXXX-XXXX)
const formatPhone = (v: any): string => {
  const digits = String(v).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

{ key: 'phone', title: '휴대전화', type: 'text', onInput: formatPhone }
```

---

## 툴바 (Toolbar)

그리드 우측 상단에 버튼 영역을 제공합니다. 기본 제공 버튼과 커스텀 슬롯을 자유롭게 조합할 수 있습니다.

```vue
<WZGrid
  :showAdd="true"
  :showDelete="true"
  @click:add="handleAdd"
  @click:delete="handleDelete"
>
  <!-- 개발자 커스텀 버튼 (슬롯으로 자유롭게 추가) -->
  <template #toolbar>
    <button @click="exportCSV">CSV 내보내기</button>
    <button @click="openFilter">필터</button>
  </template>
</WZGrid>
```

**기본 제공 버튼:**

| 버튼 | prop | 이벤트 | 비고 |
| :--- | :--- | :--- | :--- |
| 추가 | `showAdd` | `@click:add` | 항상 활성 |
| 삭제 | `showDelete` | `@click:delete` | 체크된 행이 없으면 비활성. 페이로드: 체크된 row 배열 |

**커스텀 슬롯 (`#toolbar`):**
- `<template #toolbar>` 안에 임의의 HTML/컴포넌트 삽입 가능
- 커스텀 슬롯 버튼은 기본 버튼(추가/삭제) 왼쪽에 배치됨
- 슬롯과 기본 버튼 사이에 구분선 자동 표시

**`@click:delete` 처리 예제:**

```ts
const handleDelete = (checkedList: any[]) => {
  if (!confirm(`${checkedList.length}건을 삭제하시겠습니까?`)) return;
  const ids = new Set(checkedList.map(r => r.id));
  rows.value = rows.value.filter(r => !ids.has(r.id));
};
```

**`@click:add` 처리 예제:**

```ts
const handleAdd = () => {
  rows.value = [{ id: Date.now(), name: '', ... }, ...rows.value];
};
```

---

## 인쇄 (Print)

`src/utils/print.ts`의 `printGrid` 유틸 함수로 새 탭에 인쇄 레이아웃을 생성합니다.
가상 스크롤 특성상 DOM에 렌더링되지 않은 행도 **전체 rows 배열 기준**으로 출력합니다.

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
- 용지 방향: A4 가로 (CSS `@page` 설정)
- 팝업 차단 시 안내 메시지 표시

---

## 체크박스 (Checkbox)

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
| 선택된 행 | 연한 파란 배경으로 하이라이트 |
| 페이징 바 | `N건 선택됨` 카운트 표시 |

**`@update:checked`** 이벤트 페이로드: 현재 체크된 전체 row 객체 배열.

```ts
const checkedRows = ref<any[]>([]);
// 체크 변경마다 전체 체크된 rows 배열로 업데이트
```

- 체크 기준은 **전체 rows** (페이지 관계없이 유지)
- `rows` prop이 교체되면 체크 상태 자동 초기화
- 체크박스 컬럼은 선택/편집/복사에서 제외됨
- pinned 컬럼이 있을 경우 left 오프셋에 체크박스 너비(40px)가 자동으로 반영됨

---

## 말줄임 & 툴팁 (Truncate & Tooltip)

### `truncate` — 말줄임표 처리

셀 내용이 컬럼 너비를 초과할 때 `...`으로 자르는 여부를 지정합니다. **기본값은 `true`** (생략 시 항상 말줄임 적용).

```ts
// 기본 동작 (생략 == truncate: true)
{ key: 'name', title: '이름', width: 120 }

// 명시적 비활성화 (내용 잘리지 않고 셀 밖으로 숨겨짐)
{ key: 'memo', title: '메모', width: 200, truncate: false }
```

### `tooltip` — 호버 툴팁

`tooltip: true`를 설정하면 셀에 마우스를 올렸을 때 전체 내용을 툴팁으로 표시합니다.
`select` / `badge` 타입은 value 대신 **label**을 표시하고, `number` 타입은 천 단위 포맷으로 표시합니다.

```ts
{
  key: 'address', title: '주소', width: 200, type: 'text',
  truncate: true,  // 셀에서는 말줄임
  tooltip: true,   // hover 시 전체 주소 표시
}
```

> 에러가 있는 셀은 에러 툴팁이 우선 표시됩니다.

---

**검증 동작 시점:**
- 컴포넌트 마운트 시 전체 rows에 대해 즉시 실행
- `rows` prop 변경 시 자동 재검증
- 셀 편집 후 저장(Enter/blur) 시 해당 셀 재검증

---

## 12. 컬럼 고정 (Pinned)

`pinned: true`를 설정하면 해당 컬럼이 좌측에 고정(sticky)됩니다.
수평 스크롤 시에도 항상 화면에 표시됩니다.

```ts
const columns = [
  { key: 'id',   title: 'ID',   width: 60,  pinned: true },
  { key: 'name', title: '이름', width: 120, pinned: true },
  // 이후 컬럼들은 고정 없이 스크롤
  { key: 'dept', title: '부서', width: 100 },
];
```

- 여러 컬럼에 `pinned: true` 지정 가능
- 고정 컬럼들은 순서대로 좌측에 누적 배치됨 (`left` 오프셋 자동 계산)
- 헤더와 바디 모두 동일하게 고정 (z-index 처리)

---

## 13. 컬럼 리사이즈

헤더 셀 오른쪽 경계에 마우스를 올리면 리사이즈 커서가 표시됩니다.
드래그하여 너비를 조절하고, `@resize:column` 이벤트로 결과를 받아 컬럼 정의를 업데이트합니다.

```ts
const handleResize = ({ colIdx, width }: { colIdx: number; width: number }) => {
  columns.value[colIdx].width = width;
};
```

- 최소 너비: 50px
- 실시간으로 너비 변경 반영

---

## 14. CSV 내보내기

`src/utils/tsv.ts`의 `downloadCSV` 유틸 함수를 사용합니다.

```ts
import { downloadCSV } from './utils/tsv';

const exportCSV = () => {
  downloadCSV(rows.value, columns.value, 'export.csv');
};
```

```vue
<button @click="exportCSV">CSV 내보내기</button>
```

---

## 15. 종합 예제

아래는 WZ-Grid의 주요 기능을 모두 활용하는 예제입니다.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import WZGrid from './components/WZGrid.vue';
import { downloadCSV } from './utils/tsv';
import type { Column } from './types/grid';

const currentPage = ref(1);
const pageSize = ref(20);

const columns = ref<Column[]>([
  // 고정 컬럼
  { key: 'id',     title: 'ID',     width: 60,  pinned: true, align: 'center' },
  { key: 'avatar', title: '사진',   width: 60,  pinned: true, type: 'image' },
  { key: 'name',   title: '이름',   width: 120, pinned: true, required: true },

  // 라디오
  {
    key: 'gender', title: '성별', width: 120, type: 'radio', align: 'center',
    options: [{ label: '남', value: 'M' }, { label: '여', value: 'F' }]
  },

  // 배지
  {
    key: 'status', title: '상태', width: 100, type: 'badge', align: 'center',
    options: [
      { value: 'Active',   label: '활성', color: 'bg-green-100 text-green-700' },
      { value: 'Pending',  label: '대기', color: 'bg-yellow-100 text-yellow-700' },
      { value: 'Inactive', label: '중단', color: 'bg-red-100 text-red-700' },
    ]
  },

  // 숫자 + 커스텀 검증
  {
    key: 'salary', title: '급여', width: 130, type: 'number', align: 'right',
    validator: (v) => v < 0 ? '급여는 0 이상이어야 합니다.' : null
  },

  // 셀렉트
  {
    key: 'dept', title: '부서', width: 120, type: 'select',
    options: [
      { value: 'dev', label: '개발팀' },
      { value: 'biz', label: '사업팀' },
      { value: 'hr',  label: '인사팀' },
    ]
  },

  // 프로그레스
  { key: 'completion', title: '완료율', width: 150, type: 'progress' },

  // 체크박스
  { key: 'active', title: '활성', width: 80, type: 'boolean', align: 'center' },

  // 링크
  { key: 'profile', title: '프로필', width: 200, type: 'link' },

  // 버튼
  {
    key: 'action', title: '관리', width: 100, type: 'button', align: 'center',
    options: [{ label: '상세보기' }]
  },
]);

const rows = ref(
  Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    avatar: `https://i.pravatar.cc/150?u=${i + 1}`,
    name: `User ${i + 1}`,
    gender: i % 2 === 0 ? 'M' : 'F',
    status: ['Active', 'Pending', 'Inactive'][i % 3],
    salary: Math.floor(Math.random() * 100000) + 30000,
    dept: ['dev', 'biz', 'hr'][i % 3],
    completion: Math.floor(Math.random() * 100),
    active: i % 3 !== 2,
    profile: `https://example.com/user/${i + 1}`,
  }))
);

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};

const handleResize = ({ colIdx, width }: any) => {
  columns.value[colIdx].width = width;
};

const handleSort = ({ key, order }: any) => {
  rows.value.sort((a, b) => {
    const mod = order === 'asc' ? 1 : -1;
    return (a[key] > b[key] ? 1 : -1) * mod;
  });
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
    v-model:currentPage="currentPage"
    v-model:pageSize="pageSize"
    @update:cell="handleUpdate"
    @resize:column="handleResize"
    @sort="handleSort"
    @click:button="handleButtonClick"
  />
  <button @click="exportCSV">CSV 내보내기</button>
</template>
```

---

## 16. 내부 구조 (Architecture)

```
src/
├── components/
│   └── WZGrid.vue          # 메인 그리드 컴포넌트
├── composables/
│   ├── useSelection.ts     # 셀 선택 및 범위 선택 로직
│   ├── useClipboard.ts     # 복사/붙여넣기 (TSV 기반)
│   └── useVirtualScroll.ts # 가상 스크롤 엔진
├── types/
│   └── grid.ts             # Column, GridData, Selection 타입 정의
├── utils/
│   └── tsv.ts              # TSV 파싱/직렬화, CSV 다운로드
└── index.ts                # 컴포넌트 및 타입 export
```

### useSelection

- `selection`: `{ startRow, startCol, endRow, endCol }` 반응형 객체
- `startSelection(row, col)`: 마우스다운 시 선택 시작
- `updateSelection(row, col)`: 마우스무브 시 범위 확장
- `endSelection()`: 마우스업 시 드래그 종료
- `isSelected(row, col)`: 특정 셀이 선택 범위 내인지 확인
- `clearSelection()`: 선택 해제
- `moveSelection(dir, shift, maxRow, maxCol)`: 키보드 방향키 이동

### useVirtualScroll

- 파라미터: `totalRows (Ref<number>)`, `rowHeight`, `viewportHeight`, `buffer (기본 5)`
- `visibleRange`: 렌더링할 행 인덱스 범위 `{ startIdx, endIdx }`
- `topPadding` / `bottomPadding`: 보이지 않는 행의 공간을 padding으로 대체
- `onScroll`: 스크롤 이벤트 핸들러

### useClipboard

- `onCopy(e)`: 선택 범위의 셀 값을 TSV 문자열로 클립보드에 복사
- `onPaste(e)`: 클립보드의 TSV 데이터를 파싱하여 시작 셀부터 순서대로 `updateCell` 호출

---

*최종 업데이트: 2026-03-13 — 인쇄(printGrid), 툴바(showAdd/showDelete/#toolbar 슬롯), 체크박스, truncate/tooltip, 주소 컬럼, onInput 포맷터, date 달력 UI*
