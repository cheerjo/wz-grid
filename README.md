# WZ-Grid

> 엔터프라이즈급 고성능 데이터 그리드 — Vue 2/3 및 React 지원

[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)

---

## 패키지 구성

이 저장소는 pnpm 모노레포로 구성되어 있습니다.

| 패키지 | 버전 | 설명 |
| --- | --- | --- |
| [`@wezon/wz-grid-core`](./packages/core) | 0.1.0 | 프레임워크 독립 헤드리스 코어 (순수 TypeScript) |
| [`@wezon/wz-grid-vue`](./packages/vue) | 1.5.0 | Vue 2/3 컴포넌트 래퍼 |
| [`@wezon/wz-grid-react`](./packages/react) | 0.1.0 | React 컴포넌트 래퍼 |

---

## 설치

### Vue

```bash
npm install @wezon/wz-grid-vue
```

```js
import '@wezon/wz-grid-vue/dist/wz-grid-vue.css';
```

### React

```bash
npm install @wezon/wz-grid-react
```

### 코어만 단독 사용

```bash
npm install @wezon/wz-grid-core
```

---

## 주요 기능

| 기능 | Vue | React |
| --- | :---: | :---: |
| 가상 스크롤 | O | O |
| 다중 정렬 | O | O |
| 컬럼별 필터 | O | O |
| 페이징 | O | O |
| 체크박스 | O | O |
| 인라인 편집 | O | O |
| Undo / Redo | O | O |
| 셀 병합 | O | 예정 |
| 트리 구조 | O | 예정 |
| 그룹핑 | O | 예정 |
| Excel 내보내기 | O | 예정 |
| CSV 내보내기 | O | 예정 |
| 행·컬럼 드래그 | O | 예정 |

---

## 빠른 시작

### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { WZGrid } from '@wezon/wz-grid-vue';
import type { Column } from '@wezon/wz-grid-vue';

const columns = ref<Column[]>([
  { key: 'id', title: 'ID', width: 60 },
  { key: 'name', title: '이름', width: 150, editable: true },
]);
const rows = ref([{ id: 1, name: '홍길동' }]);
</script>

<template>
  <WZGrid :columns="columns" :rows="rows" :height="400" />
</template>
```

### React

```tsx
import { WZGrid } from '@wezon/wz-grid-react';

const columns = [
  { key: 'id', title: 'ID', width: 60 },
  { key: 'name', title: 'Name', width: 150, editable: true },
];
const rows = [{ id: 1, name: 'Alice' }];

export default function App() {
  return <WZGrid columns={columns} rows={rows} height={400} />;
}
```

---

## 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 데모 앱 개발 서버 (Vue + MSW)
pnpm dev

# 코어 패키지 빌드
pnpm --filter @wezon/wz-grid-core build

# Vue 패키지 빌드
pnpm --filter @wezon/wz-grid-vue build

# React 패키지 빌드
pnpm --filter @wezon/wz-grid-react build

# 테스트 실행
pnpm test

# VitePress 문서 개발 서버
pnpm docs:dev
```

---

## wz-grid → @wezon/wz-grid-vue 마이그레이션

기존 `wz-grid` 패키지 사용자는 패키지명만 교체하면 됩니다. API는 동일합니다.

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

- [전체 API 레퍼런스 (DOCS.md)](./DOCS.md)
- [VitePress 가이드](./docs/guide/)

---

## 라이선스

[MIT License](./LICENSE.md) — Copyright (c) 2024 (주)위존

문의: **jmcho@wezon.com**
