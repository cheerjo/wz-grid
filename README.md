# WZ-Grid

> Vue 2 & 3를 동시에 지원하는 엔터프라이즈급 고성능 데이터 그리드 컴포넌트

[![npm version](https://img.shields.io/npm/v/wz-grid.svg)](https://www.npmjs.com/package/wz-grid)
[![Vue 2 & 3](https://img.shields.io/badge/Vue-2%20%26%203-42b883.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](./LICENSE.md)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| ⚡ 가상 스크롤 | 수십만 행도 버벅임 없이 렌더링 |
| 📋 Excel 연동 | Ctrl+C/V로 Excel과 데이터 완벽 호환 |
| 🔒 실시간 검증 | required, min, max, regex 등 컬럼별 검증 규칙 |
| 🎨 10종 컬럼 타입 | text, number, select, date, badge, button 등 |
| 🖱️ 드래그 & 드롭 | 컬럼/행 순서를 드래그로 자유롭게 변경 |
| 📌 컬럼 고정 | 좌측 컬럼 sticky 고정 |
| 🔍 정렬 & 필터 | 다중 정렬 (Shift+클릭), 컬럼별 실시간 필터 |
| 📄 페이징 | 내장 페이지네이션 UI |
| 🖨️ 인쇄 & CSV | 브라우저 인쇄 최적화, CSV 내보내기 |
| 🔧 Vue 2 & 3 | vue-demi 기반, 두 버전 동시 지원 |

---

## 설치

```bash
npm install wz-grid
```

CSS를 반드시 임포트해야 합니다:

```js
// main.ts 또는 main.js
import 'wz-grid/dist/wz-grid.css'
```

---

## 빠른 시작

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WZGrid } from 'wz-grid'
import type { Column } from 'wz-grid'

const columns = ref<Column[]>([
  { key: 'id',   title: 'ID',   width: 60 },
  { key: 'name', title: '이름', width: 150, editable: true },
  { key: 'dept', title: '부서', width: 120, editable: true, type: 'select',
    options: [{ value: 'dev', label: '개발팀' }, { value: 'biz', label: '사업팀' }] },
  { key: 'score', title: '점수', width: 80, type: 'number', align: 'right',
    rules: [{ type: 'min', value: 0 }, { type: 'max', value: 100 }] },
])

const rows = ref([
  { id: 1, name: '홍길동', dept: 'dev', score: 95 },
  { id: 2, name: '김철수', dept: 'biz', score: 80 },
])

const handleUpdate = ({ row, colKey, value }: any) => {
  const target = rows.value.find(r => r.id === row.id)
  if (target) (target as any)[colKey] = value
}
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="500"
    :use-checkbox="true"
    :show-add="true"
    :show-delete="true"
    :use-filter="true"
    @update:cell="handleUpdate"
    @click:add="rows.push({ id: Date.now(), name: '', dept: '', score: 0 })"
  />
</template>
```

> **필수 조건**: 각 row 객체에는 반드시 고유한 `id` 필드가 있어야 합니다.

---

## Props

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `columns` | `Column[]` | — | **(필수)** 컬럼 정의 배열 |
| `rows` | `any[]` | — | **(필수)** 행 데이터 배열 |
| `height` | `number` | `500` | 그리드 높이(px) |
| `rowHeight` | `number` | `40` | 행 높이(px) |
| `usePaging` | `boolean` | `false` | 페이징 활성화 |
| `pageSize` | `number` | `20` | 페이지당 행 수 |
| `useCheckbox` | `boolean` | `false` | 체크박스 열 |
| `showAdd` | `boolean` | `false` | 툴바 추가 버튼 |
| `showDelete` | `boolean` | `false` | 툴바 삭제 버튼 |
| `useFilter` | `boolean` | `false` | 컬럼별 필터 행 |
| `showColumnSettings` | `boolean` | `false` | 컬럼 표시/숨기기 버튼 |
| `groupBy` | `string` | `''` | 그룹핑 기준 컬럼 key |
| `useContextMenu` | `boolean` | `false` | 우클릭 컨텍스트 메뉴 |
| `useRowDrag` | `boolean` | `false` | 행 드래그 재배치 |
| `autoMergeCols` | `string[]` | `[]` | 자동 셀 병합 컬럼 목록 |

---

## Events

| 이벤트 | 페이로드 | 설명 |
| :--- | :--- | :--- |
| `@update:cell` | `{ rowIdx, row, colKey, value }` | 셀 값 변경 |
| `@sort` | `SortConfig[]` | 정렬 변경 |
| `@resize:column` | `{ colIdx, colKey, width }` | 컬럼 너비 변경 |
| `@reorder:columns` | `{ srcKey, targetKey }` | 컬럼 순서 변경 |
| `@reorder:rows` | `{ from, to, position }` | 행 순서 변경 |
| `@click:add` | — | 추가 버튼 클릭 |
| `@click:delete` | `any[]` | 삭제 버튼 클릭 |
| `@click:button` | `{ rowIdx, row, colKey }` | button 셀 클릭 |

---

## 라이선스

- **개인 / 오픈소스**: 무료 (Community License)
- **상업적 사용**: Pro 또는 Enterprise 라이선스 필요

자세한 내용은 [LICENSE.md](./LICENSE.md) 및 [가격 페이지](https://wz-grid.com/pricing)를 참고하세요.

문의: **contact@wz-grid.com**
