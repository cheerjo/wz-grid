# @wezon/wz-grid-vue

> Vue 2/3 component for WZ-Grid — 엔터프라이즈급 그리드 컴포넌트

[![npm version](https://img.shields.io/npm/v/@wezon/wz-grid-vue.svg)](https://www.npmjs.com/package/@wezon/wz-grid-vue)
[![Vue 2 & 3](https://img.shields.io/badge/Vue-2%20%26%203-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE.md)

---

## 설치

```bash
npm install @wezon/wz-grid-vue
```

CSS를 반드시 임포트해야 합니다:

```js
// main.ts 또는 main.js
import '@wezon/wz-grid-vue/dist/wz-grid-vue.css';
```

Vue 2 사용자는 `@vue/composition-api`도 함께 설치해야 합니다:

```bash
npm install @vue/composition-api
```

---

## 빠른 시작

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { WZGrid } from '@wezon/wz-grid-vue';
import type { Column } from '@wezon/wz-grid-vue';

const columns = ref<Column[]>([
  { key: 'id', title: 'ID', width: 60 },
  { key: 'name', title: '이름', width: 150, editable: true },
  {
    key: 'dept',
    title: '부서',
    width: 120,
    editable: true,
    type: 'select',
    options: [
      { value: 'dev', label: '개발팀' },
      { value: 'biz', label: '사업팀' },
    ],
  },
  { key: 'score', title: '점수', width: 80, type: 'number', align: 'right' },
]);

const rows = ref([
  { id: 1, name: '홍길동', dept: 'dev', score: 95 },
  { id: 2, name: '김철수', dept: 'biz', score: 80 },
]);

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find((r) => r.id === row.id);
  if (target) (target as any)[colKey] = value;
};
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="500"
    :use-checkbox="true"
    :use-filter="true"
    :show-add="true"
    :show-delete="true"
    @update:cell="handleUpdate"
    @click:add="rows.push({ id: Date.now(), name: '', dept: '', score: 0 })"
  />
</template>
```

> 각 row 객체에는 반드시 고유한 `id` 필드가 있어야 합니다.

---

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 가상 스크롤 | 수십만 행도 버벅임 없이 렌더링 |
| 셀 병합 | `autoMergeCols` / `mergeCells` 정적·동적 병합 |
| 트리 구조 | `useTree` — 계층형 데이터를 접기/펼치기로 표시 |
| 그룹핑 | `groupBy` — 컬럼 값 기준 자동 그룹헤더 + 소계 |
| 다중 정렬 | Shift+클릭으로 N개 컬럼 복합 정렬 |
| 컬럼별 필터 | 텍스트·숫자·날짜 범위 필터, 서버사이드 debounce |
| 체크박스 | 전체선택 / 개별선택, `v-model:checkedIds` |
| 실시간 편집 | text, number, date, select 등 10종 컬럼 타입 인라인 편집 |
| Undo / Redo | Ctrl+Z / Ctrl+Y 셀 편집 되돌리기 |
| Excel 연동 | Ctrl+C/V 클립보드 호환, XLSX 내보내기 |
| CSV 내보내기 | RFC 4180, CSV injection 방어, BOM 포함 |
| 페이징 | 내장 페이지네이션 UI |
| 행·컬럼 드래그 | 순서 자유롭게 변경 |
| 컨텍스트 메뉴 | 우클릭 메뉴 (Pro 기능) |
| 컬럼 고정 | 좌측 sticky 고정 |
| 컬럼 설정 | 표시/숨기기 패널 |
| 인쇄 | 브라우저 인쇄 최적화 |
| Vue 2 & 3 | vue-demi 기반, 두 버전 동시 지원 |
| TypeScript | 완전한 제네릭 타입 (`Column<T>`, `GridRow<T>`) |
| a11y | ARIA 속성, 키보드 네비게이션, 포커스 트랩 |

---

## 컬럼 타입

| 타입 | 편집 가능 | 설명 |
| --- | --- | --- |
| `text` | O | 기본 텍스트 |
| `number` | O | 숫자 (우측 정렬) |
| `date` / `datetime` | O | 날짜 피커 |
| `select` | O | 드롭다운 선택 |
| `currency` | O | 통화 포맷 |
| `email` | O | 이메일 |
| `textarea` | O | 여러 줄 텍스트 |
| `boolean` | 클릭 즉시 | 체크박스 토글 |
| `radio` | 클릭 즉시 | 라디오 선택 |
| `rating` | 클릭 즉시 | 별점 |
| `color` | 클릭 즉시 | 색상 피커 |
| `badge` | X | 상태 배지 |
| `progress` | X | 진행률 바 |
| `image` | X | 이미지 |
| `button` | X | 액션 버튼 |
| `link` | X | 하이퍼링크 |

---

## 마이그레이션 (wz-grid → @wezon/wz-grid-vue)

기존 `wz-grid` 패키지를 사용 중이라면 패키지명만 변경하면 됩니다. Public API는 동일합니다.

```bash
npm uninstall wz-grid
npm install @wezon/wz-grid-vue
```

```diff
- import { WZGrid } from 'wz-grid';
+ import { WZGrid } from '@wezon/wz-grid-vue';

- import 'wz-grid/dist/wz-grid.css';
+ import '@wezon/wz-grid-vue/dist/wz-grid-vue.css';
```

---

## 문서

- [전체 API 레퍼런스 (DOCS.md)](../../DOCS.md)
- [가이드 문서 (VitePress)](https://github.com/cheerjo/wz-grid)

---

## License

[MIT](./LICENSE.md) — Copyright (c) 2024 (주)위존
