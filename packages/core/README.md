# @wezon/wz-grid-core

> Framework-agnostic headless core for WZ-Grid — pure TypeScript engines and types.

[![npm version](https://img.shields.io/npm/v/@wezon/wz-grid-core.svg)](https://www.npmjs.com/package/@wezon/wz-grid-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE.md)

---

## Why headless?

`@wezon/wz-grid-core` ships **only pure TypeScript engines** — no DOM, no Vue, no React. Framework-specific wrappers (`wz-grid-vue`, `@wezon/wz-grid-react`) consume this package and expose their own idiomatic APIs. This separation means:

- You can use the engines in any runtime (browser, Node.js, Deno, Bun).
- Tree-shaking works precisely — import only what you need.
- Logic is tested independently from rendering.

---

## Installation

```bash
npm install @wezon/wz-grid-core
```

---

## Usage

### Sort

```ts
import { sortRows } from '@wezon/wz-grid-core';

const sorted = sortRows(rows, [{ key: 'age', dir: 'asc' }], columns);
```

### Filter

```ts
import { createFilterEngine } from '@wezon/wz-grid-core';

const engine = createFilterEngine(columns);
const filtered = engine.filterRows(rows, filters);
```

### Checkbox

```ts
import { createCheckboxEngine } from '@wezon/wz-grid-core';

const engine = createCheckboxEngine();
engine.toggleAll(rows);
console.log(engine.checkedIds); // Set<string | number>
```

### Undo / Redo

```ts
import { createUndoRedoEngine } from '@wezon/wz-grid-core';

const history = createUndoRedoEngine({ maxDepth: 50 });
history.push({ rowId: 1, colKey: 'name', oldValue: 'Alice', newValue: 'Bob' });
const undone = history.undo(); // { rowId: 1, colKey: 'name', oldValue: 'Bob', newValue: 'Alice' }
```

### CSV Export

```ts
import { exportCSV } from '@wezon/wz-grid-core';

exportCSV(columns, rows, { filename: 'data.csv', delimiter: ',', bom: true });
```

---

## API Overview

### Types

| Export | Description |
| --- | --- |
| `Column<T>` | Column definition — key, type, title, width, rules, etc. |
| `GridRow<T>` | Row data shape (requires `id` field) |
| `ColumnType` | Union of all supported column type strings |
| `SortConfig` | `{ key, dir }` sort descriptor |
| `CellUpdateEvent<T>` | Payload emitted on cell edit |
| `HistoryEntry<T>` | Undo/redo history record |
| `MergeState` | Cell-merge span map |
| `Selection` | `{ startRow, startCol, endRow, endCol }` |
| `GridItem<T>` | Union of `DataItem`, `GroupHeader`, `SubtotalItem` |
| `WZGridPlugin` | Plugin hook interface |

### Sort Engine

| Function | Description |
| --- | --- |
| `sortRows(rows, configs, columns)` | Sort rows by one or more columns |
| `computeToggleSort(configs, key, multi)` | Toggle sort direction, return new config array |
| `createSortEngine()` | Stateful sort engine |

### Filter Engine

| Function | Description |
| --- | --- |
| `filterRows(rows, filters, columns)` | Filter rows by column filter map |
| `createFilterEngine(columns)` | Stateful filter engine with active-count tracking |
| `countActiveFilters(filters)` | Count columns with active filters |

### Tree Engine

| Function | Description |
| --- | --- |
| `flattenTree(rows)` | Flatten hierarchical rows to a flat list |
| `buildVisibleIds(rows, collapsed)` | Compute visible IDs given collapsed set |
| `createTreeEngine()` | Stateful collapse/expand engine |

### Grouping Engine

| Function | Description |
| --- | --- |
| `buildGroupedItems(rows, key, columns)` | Build `GroupHeader + DataItem + SubtotalItem` list |
| `createGroupingEngine()` | Stateful grouping engine |

### Merge Engine

| Function | Description |
| --- | --- |
| `computeMerge(items, cols)` | Build `MergeState` span map |
| `getMergeSpan(state, itemIdx)` | Get merge block `[start, end)` for a row index |

### Virtual Scroll Engine

| Function | Description |
| --- | --- |
| `computeVisibleRange(scrollTop, rowHeight, viewportHeight, total)` | Compute visible row index range |
| `computePadding(range, rowHeight, total)` | Compute top/bottom spacer heights |
| `createVirtualScrollEngine()` | Stateful virtual scroll engine |

### Checkbox Engine

| Function | Description |
| --- | --- |
| `createCheckboxEngine()` | Toggle individual rows or all; tracks `checkedIds` Set |

### Selection Engine

| Function | Description |
| --- | --- |
| `createSelectionEngine()` | Range selection `{ startRow, startCol, endRow, endCol }` |

### Undo/Redo Engine

| Function | Description |
| --- | --- |
| `createUndoRedoEngine(opts)` | LIFO undo/redo stack with configurable `maxDepth` |

### CSV / Excel / Print

| Export | Description |
| --- | --- |
| `exportCSV(columns, rows, opts)` | Download CSV with RFC 4180 quoting and CSV-injection guard |
| `exportExcel(columns, rows, opts)` | Download XLSX via ExcelJS |
| `printGrid(columns, rows, opts)` | Open browser print dialog with grid HTML |
| `escapeCSVField(value)` | OWASP CSV-injection-safe field escaping |

### i18n

| Export | Description |
| --- | --- |
| `ko` | Korean locale messages |
| `en` | English locale messages |
| `createI18nEngine(locale, messages)` | Build translation function |

---

## License

[MIT](./LICENSE.md) — Copyright (c) 2024 (주)위존
