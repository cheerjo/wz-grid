# 트리 구조 (Tree Grid)

`useTree` prop을 활성화하면 중첩된 계층 데이터를 트리 구조로 표시합니다.
조직도, 파일 탐색기, 카테고리 트리 등에 활용할 수 있습니다.

## 라이브 데모

<ClientOnly>
  <DemoTree />
</ClientOnly>

## 기본 사용

### 데이터 준비

각 행 객체에 `children` 배열을 중첩합니다. 깊이 제한 없이 재귀적으로 지원합니다.

```ts
const rows = ref([
  {
    id: 1, name: '홍길동', role: '대표이사',
    children: [
      {
        id: 2, name: '김개발', role: '개발팀장',
        children: [
          { id: 5, name: '이주니어', role: '개발자' },
          { id: 6, name: '박시니어', role: '시니어 개발자' },
        ],
      },
      { id: 3, name: '최디자인', role: '디자인팀장' },
    ],
  },
])
```

### 그리드 설정

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :useTree="true"
  treeKey="name"
/>
```

- `useTree="true"` — 트리 모드 활성화
- `treeKey` — 들여쓰기와 펼치기/접기 버튼을 표시할 컬럼 key
  미지정 시 첫 번째 컬럼에 자동 적용

## Props

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `useTree` | `boolean` | `false` | 트리 모드 활성화 |
| `treeKey` | `string` | `''` | 트리 인덴트·토글 버튼을 표시할 컬럼 key. 미지정 시 첫 번째 컬럼 |
| `childrenKey` | `string` | `'children'` | 자식 행 배열 필드명 |

## 펼치기 / 접기

### 개별 노드

트리 컬럼의 ▶ 아이콘을 클릭하면 해당 노드의 자식이 펼쳐지거나 접힙니다.
리프 노드(자식 없음)에는 점(•)이 표시됩니다.

### 전체 제어

`useTree="true"` 시 툴바에 **모두 펼치기 / 모두 접기** 버튼이 자동으로 나타납니다.

## 필터 연동

`useFilter="true"`와 함께 사용하면 입력한 키워드가 **모든 레벨**에서 검색됩니다.

```vue
<WZGrid
  :useTree="true"
  :useFilter="true"
  ...
/>
```

- 일치하는 노드와 그 **조상 노드**가 함께 표시됩니다
- 조상 노드는 필터와 무관하게 컨텍스트 유지를 위해 항상 표시됩니다
- 일치하는 노드가 없으면 빈 그리드가 표시됩니다

## 푸터 집계 연동

`showFooter="true"`와 함께 사용하면 필터된 모든 노드를 대상으로 집계합니다.

```vue
<WZGrid
  :useTree="true"
  :showFooter="true"
  ...
/>
```

```ts
const columns = [
  { key: 'name',   title: '이름', type: 'text' },
  { key: 'salary', title: '연봉', type: 'number', align: 'right',
    footer: 'sum', footerLabel: '합계' },
]
```

## 커스텀 `childrenKey`

기본 `children` 대신 다른 필드명을 사용하는 경우 `childrenKey`로 지정합니다.

```ts
// 데이터
const rows = [{ id: 1, name: '루트', subItems: [{ id: 2, name: '자식' }] }]
```

```vue
<WZGrid :useTree="true" childrenKey="subItems" ... />
```

## 제한 사항

| 기능 | 트리 모드와 조합 |
| :--- | :--- |
| 필터 (`useFilter`) | ✅ 지원 |
| 푸터 집계 (`showFooter`) | ✅ 지원 |
| 체크박스 (`useCheckbox`) | ✅ 지원 |
| 페이징 (`usePaging`) | ✅ 지원 |
| 정렬 (`sort`) | ✅ 루트 레벨 기준 |
| 가상 스크롤 | ✅ 자동 적용 |
| 그룹핑 (`groupBy`) | ❌ 트리 모드에서 비활성화 |
| 셀 병합 (`autoMergeCols`) | ❌ 트리 모드와 동시 사용 비권장 |

## 전체 예제

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WZGrid } from 'wz-grid'
import type { Column } from 'wz-grid'

const columns: Column[] = [
  { key: 'name',   title: '이름',     width: 200, type: 'text', pinned: true },
  { key: 'role',   title: '직책',     width: 150, type: 'text' },
  { key: 'dept',   title: '부서',     width: 120, type: 'text', align: 'center' },
  { key: 'salary', title: '연봉(원)', width: 150, type: 'number', align: 'right',
    footer: 'sum', footerLabel: '합계' },
]

const rows = ref([
  {
    id: 1, name: '홍길동', role: '대표이사', dept: '경영', salary: 200000000,
    children: [
      {
        id: 2, name: '김개발', role: '개발팀장', dept: '개발', salary: 95000000,
        children: [
          { id: 5, name: '이주니어', role: '개발자',        dept: '개발', salary: 42000000 },
          { id: 6, name: '박시니어', role: '시니어 개발자', dept: '개발', salary: 78000000 },
        ],
      },
      {
        id: 3, name: '최디자인', role: '디자인팀장', dept: '디자인', salary: 82000000,
        children: [
          { id: 7, name: '정UX', role: 'UX 디자이너', dept: '디자인', salary: 58000000 },
        ],
      },
    ],
  },
])
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="400"
    :useTree="true"
    treeKey="name"
    :useFilter="true"
    :showFooter="true"
  />
</template>
```
