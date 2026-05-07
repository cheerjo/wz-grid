# @wezon/wz-grid-react

> React wrapper for WZ-Grid — built on @wezon/wz-grid-core

[![npm version](https://img.shields.io/npm/v/@wezon/wz-grid-react.svg)](https://www.npmjs.com/package/@wezon/wz-grid-react)
[![React](https://img.shields.io/badge/React-18%20%26%2019-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE.md)

---

## Installation

```bash
npm install @wezon/wz-grid-react
```

---

## Quick Start

```tsx
import { WZGrid } from '@wezon/wz-grid-react';
import type { Column } from '@wezon/wz-grid-react';
import '@wezon/wz-grid-react/dist/wz-grid-react.css';

const columns: Column[] = [
  { key: 'id',    title: 'ID',    width: 60 },
  { key: 'name',  title: 'Name',  width: 150, editable: true },
  { key: 'score', title: 'Score', width: 80,  type: 'number', align: 'right' },
];

const rows = [
  { id: 1, name: 'Alice', score: 98 },
  { id: 2, name: 'Bob',   score: 72 },
];

export default function App() {
  return (
    <WZGrid
      columns={columns}
      rows={rows}
      height={500}
      showCheckbox
      useFilter
      usePaging
      pageSize={20}
      onCellUpdate={({ row, colKey, value }) => {
        console.log('Cell updated:', row.id, colKey, value);
      }}
    />
  );
}
```

> Each row object must have a unique `id` field.

---

## Features (v0.2.0)

| Feature | Status |
| --- | --- |
| Virtual scroll | Supported |
| Sort (multi-column) | Supported |
| Column filter | Supported |
| Pagination | Supported |
| Checkbox selection | Supported |
| Text / number edit | Supported |
| **Tree view** | **Supported** |
| **Undo / Redo** | **Supported** |
| **Clipboard copy/paste** | **Supported** |
| **Column visibility** | **Supported** |
| **Pinned columns** | **Supported** |
| **Row detail expand** | **Supported** |
| **Excel export** | **Supported** |
| **CSV export** | **Supported** |
| **i18n (ko/en)** | **Supported** |
| Server-side mode | Supported |
| Loading state | Supported |
| Custom row class | Supported |
| TypeScript generics | Supported |

Planned for future releases: Row grouping, Cell merge, Column drag & drop, Context menu.

---

## Props

### Core

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `GridRow[]` | — | **(required)** Row data array |
| `columns` | `Column[]` | — | **(required)** Column definitions |
| `height` | `number` | — | Grid height in px |
| `rowHeight` | `number` | `36` | Row height in px |
| `showCheckbox` | `boolean` | `false` | Show checkbox column |
| `usePaging` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `50` | Rows per page |
| `useVirtualScroll` | `boolean` | `true` | Enable virtual scroll |
| `useFilter` | `boolean` | `false` | Enable column filters |
| `serverSide` | `boolean` | `false` | Delegate sort/filter to server |
| `loading` | `boolean` | `false` | Show loading overlay |

### v0.2.0 New Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `useTreeMode` | `boolean` | `false` | Enable tree view (rows need `children` field) |
| `treeKey` | `string` | `'children'` | Children array key |
| `useUndoRedo` | `boolean` | `false` | Enable Ctrl+Z / Ctrl+Y undo-redo |
| `undoRedoMaxDepth` | `number` | `50` | Max history depth |
| `useClipboard` | `boolean` | `false` | Enable Ctrl+C / Ctrl+V clipboard |
| `useColumnSettings` | `boolean` | `false` | Show column visibility toggle button |
| `renderDetail` | `(row) => ReactNode` | — | Render function for expanded row detail |
| `locale` | `'ko' \| 'en'` | `'ko'` | UI locale |
| `messages` | `Partial<Messages>` | — | Override specific UI strings |
| `onExportExcel` | `() => void` | — | Callback to trigger Excel export (shows toolbar button) |
| `onExportCsv` | `() => void` | — | Callback to trigger CSV export (shows toolbar button) |

### Callbacks

| Prop | Signature | Description |
| --- | --- | --- |
| `onRowClick` | `(row, rowIdx) => void` | Row clicked |
| `onSort` | `(configs: SortConfig[]) => void` | Sort changed (server-side) |
| `onCellUpdate` | `(event: CellUpdateEvent) => void` | Cell value changed |
| `onCheckedChange` | `(rows: GridRow[]) => void` | Checked rows changed |
| `onUndo` | `(event: CellUpdateEvent) => void` | Undo triggered |
| `onRedo` | `(event: CellUpdateEvent) => void` | Redo triggered |
| `rowClass` | `(row, idx) => string \| undefined` | Custom CSS class per row |

---

## Hooks

```ts
import {
  useSort,
  useFilter,
  useTree,
  usePaging,
  useVirtualScroll,
  useSelection,
  useCheckbox,
  useUndoRedo,
  useClipboard,
  useColumnSettings,
  useI18n,
} from '@wezon/wz-grid-react';
```

## Export Utilities

```ts
import { exportToExcel, exportToCsv } from '@wezon/wz-grid-react';

await exportToExcel(columns, rows, { filename: 'report.xlsx' });
exportToCsv(columns, rows, { filename: 'report.csv' });
```

---

## License

[MIT](./LICENSE.md) — Copyright (c) 2024 (주)위존
