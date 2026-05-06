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
  { key: 'id', title: 'ID', width: 60 },
  { key: 'name', title: 'Name', width: 150, editable: true },
  {
    key: 'role',
    title: 'Role',
    width: 120,
    type: 'select',
    editable: true,
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ],
  },
  { key: 'score', title: 'Score', width: 80, type: 'number', align: 'right' },
];

const rows = [
  { id: 1, name: 'Alice', role: 'admin', score: 98 },
  { id: 2, name: 'Bob', role: 'user', score: 72 },
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

## Features

The following features are supported in the current release:

| Feature | Status |
| --- | --- |
| Virtual scroll | Supported |
| Sort (multi-column) | Supported |
| Column filter | Supported |
| Pagination | Supported |
| Checkbox selection | Supported |
| Text / number edit | Supported |
| Undo / redo | Supported |
| Server-side mode | Supported |
| Loading state | Supported |
| Custom row class | Supported |
| TypeScript generics | Supported |

The following features are planned for future releases:

| Feature | Status |
| --- | --- |
| Tree view | Planned |
| Row grouping | Planned |
| Cell merge | Planned |
| Excel export | Planned |
| CSV export | Planned |
| Row drag & drop | Planned |
| Column drag & drop | Planned |
| Context menu | Planned |
| Column settings panel | Planned |

---

## Props

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
| `emptyText` | `string` | `'데이터가 없습니다.'` | Empty state message |

## Events (Callbacks)

| Prop | Signature | Description |
| --- | --- | --- |
| `onRowClick` | `(row, rowIdx) => void` | Row clicked |
| `onSort` | `(configs: SortConfig[]) => void` | Sort changed (server-side) |
| `onCellUpdate` | `(event: CellUpdateEvent) => void` | Cell value changed |
| `onCheckedChange` | `(rows: GridRow[]) => void` | Checked rows changed |
| `rowClass` | `(row, idx) => string \| undefined` | Custom CSS class per row |

---

## Hooks

`@wezon/wz-grid-react` also exports individual React hooks powered by `@wezon/wz-grid-core` for composing custom grid UIs:

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
} from '@wezon/wz-grid-react';
```

Each hook returns a stable API that wraps the corresponding core engine with React state management.

---

## License

[MIT](./LICENSE.md) — Copyright (c) 2024 (주)위존
