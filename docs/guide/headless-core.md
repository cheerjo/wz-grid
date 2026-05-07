# Headless Core 직접 사용

`@wezon/wz-grid-core`는 WZ-Grid의 모든 데이터 처리 로직을 **프레임워크 무관 순수 TypeScript**로 구현한 코어 패키지입니다. Vue/React 래퍼를 거치지 않고, 원하는 프레임워크나 환경에서 직접 사용할 수 있습니다.

## 누가 쓰면 좋은가

- **Svelte, Solid, Angular** 등 Vue/React 이외의 프레임워크 사용자
- 기존 컴포넌트 라이브러리에 그리드 로직만 통합하고 싶은 경우
- 서버사이드(Node.js)에서 정렬·필터·CSV 내보내기 로직을 실행해야 하는 경우
- WZ-Grid UI 없이 데이터 처리 파이프라인만 필요한 경우

## 설치

```bash
npm install @wezon/wz-grid-core
```

## 제공 API 카테고리

### 순수 함수

데이터를 받아서 새로운 데이터를 반환하는 불변(immutable) 함수들입니다.

| 함수 | 설명 |
| :--- | :--- |
| `sortRows(rows, sortConfig)` | 컬럼 정의 기반 정렬 |
| `filterRows(rows, filtersMap, columns)` | 컬럼별 AND 필터 |
| `flattenTree(rows)` | 트리 데이터 평탄화 |
| `buildGroupedItems(rows, groupBy, columns)` | 그룹헤더·소계 삽입 |
| `computeMerge(items, autoMergeCols, mergeCells)` | 셀 병합 상태 계산 |
| `computeVisibleRange(scrollTop, rowHeight, viewportHeight, total)` | 가상 스크롤 렌더 범위 계산 |

### 상태 엔진 팩토리

상태를 내부에 가지고 있는 엔진 객체를 생성합니다. Svelte store, Solid signal 등과 연결하기 좋습니다.

| 팩토리 | 엔진이 제공하는 것 |
| :--- | :--- |
| `createSortEngine()` | `state`, `toggleSort()`, `reset()` |
| `createFilterEngine()` | `state`, `setFilter()`, `clear()` |
| `createCheckboxEngine()` | `state`, `toggle()`, `toggleAll()`, `getCheckedIds()` |
| `createSelectionEngine()` | `state`, `setRange()`, `clear()` |
| `createUndoRedoEngine()` | `push()`, `undo()`, `redo()`, `canUndo`, `canRedo` |
| `createTreeEngine()` | `state`, `toggle()`, `expandAll()`, `collapseAll()` |
| `createGroupingEngine()` | `buildItems()` |
| `createVirtualScrollEngine()` | `visibleRange`, `padding`, `onScroll()` |
| `createColumnDragEngine()` | `reorder()`, `move()` |
| `createRowDragDropEngine()` | `startDrag()`, `drop()` |
| `createColumnSettingsEngine()` | `state`, `toggle()`, `reset()` |
| `createValidationEngine()` | `validate()`, `errors` |
| `createI18nEngine()` | `t()`, `setLocale()` |
| `createPerformanceEngine()` | `mark()`, `measure()`, `getEntries()` |

### 유틸리티

| 함수 | 설명 |
| :--- | :--- |
| `exportCSV(rows, columns, options?)` | CSV 파일 다운로드 |
| `toCSV(rows, columns)` | CSV 문자열 반환 |
| `exportExcel(rows, columns, options?)` | xlsx 파일 다운로드 (exceljs 필요) |
| `printGrid(rows, columns, options?)` | 인쇄 팝업 |

## 사용 예시 — 정렬 + 필터

```ts
import {
  sortRows,
  filterRows,
  createSortEngine,
  createFilterEngine,
} from '@wezon/wz-grid-core';
import type { GridRow, Column, SortConfig } from '@wezon/wz-grid-core';

const columns: Column[] = [
  { key: 'name', title: '이름', width: 150 },
  { key: 'age',  title: '나이', width: 80, type: 'number' },
];

const rawRows: GridRow[] = [
  { id: 1, name: '홍길동', age: 30 },
  { id: 2, name: '김철수', age: 25 },
  { id: 3, name: '이영희', age: 28 },
];

// 정렬 엔진 사용
const sortEngine = createSortEngine();
sortEngine.toggleSort('age', columns);

const sorted = sortRows(rawRows, sortEngine.state, columns);
console.log(sorted.map(r => r.age)); // [25, 28, 30]

// 필터 엔진 사용
const filterEngine = createFilterEngine(columns);
filterEngine.setFilter('name', '홍');

const filtered = filterRows(sorted, filterEngine.state, columns);
console.log(filtered); // [{ id: 1, name: '홍길동', ... }]
```

## 사용 예시 — CSV 내보내기 (Node.js)

```ts
import { toCSV } from '@wezon/wz-grid-core';
import { writeFileSync } from 'node:fs';

const csv = toCSV(rows, columns);
writeFileSync('output.csv', csv, 'utf-8');
```

## Svelte 통합 예시

```svelte
<script lang="ts">
  import { createSortEngine, sortRows } from '@wezon/wz-grid-core';
  import type { Column, GridRow } from '@wezon/wz-grid-core';

  export let rows: GridRow[];
  export let columns: Column[];

  const sortEngine = createSortEngine();

  $: sortedRows = sortRows(rows, sortEngine.state, columns);

  function handleSort(colKey: string) {
    sortEngine.toggleSort(colKey, columns);
    sortedRows = sortRows(rows, sortEngine.state, columns);
  }
</script>

<table>
  <thead>
    <tr>
      {#each columns as col}
        <th on:click={() => handleSort(col.key)}>{col.title}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each sortedRows as row}
      <tr>
        {#each columns as col}
          <td>{row[col.key]}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
```

## 자세한 API 레퍼런스

각 엔진의 세부 메서드와 타입은 다음을 참고하세요.

- [packages/core/README.md](https://github.com/cheerjo/wz-grid/blob/main/packages/core/README.md) — 코어 패키지 전체 API
- [API > Composables](/api/composables) — Vue 래퍼에서 사용하는 composable 인터페이스

## 관련 문서

- [React 사용법](/guide/react)
- [Props 전체 명세](/api/props)
