// packages/react/src/index.ts — @wezon/wz-grid-react 진입점

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
export { WZGrid } from './components/WZGrid';
export type { WZGridProps } from './components/WZGrid';

export { WZGridHeader } from './components/WZGridHeader';
export type { WZGridHeaderProps } from './components/WZGridHeader';

export { WZGridRow } from './components/WZGridRow';
export type { WZGridRowProps } from './components/WZGridRow';

export { WZGridCell } from './components/WZGridCell';
export type { WZGridCellProps } from './components/WZGridCell';

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useSort } from './hooks/useSort';
export type { UseSortReturn } from './hooks/useSort';

export { useFilter } from './hooks/useFilter';
export type { UseFilterReturn } from './hooks/useFilter';

export { useTree } from './hooks/useTree';
export type { UseTreeReturn } from './hooks/useTree';

export { usePaging } from './hooks/usePaging';
export type { UsePagingReturn } from './hooks/usePaging';

export { useVirtualScroll } from './hooks/useVirtualScroll';
export type { UseVirtualScrollReturn } from './hooks/useVirtualScroll';

export { useSelection } from './hooks/useSelection';
export type { UseSelectionReturn } from './hooks/useSelection';

export { useCheckbox } from './hooks/useCheckbox';
export type { UseCheckboxReturn } from './hooks/useCheckbox';

export { useUndoRedo } from './hooks/useUndoRedo';
export type { UseUndoRedoReturn } from './hooks/useUndoRedo';

// ── 코어 타입/유틸 re-export ──────────────────────────────────────────────────
export type {
  Column,
  ColumnType,
  GridRow,
  SortConfig,
  CellUpdateEvent,
  Selection,
  DataItem,
  GridItem,
  MergeState,
} from '@wezon/wz-grid-core';
export { NON_EDITABLE_TYPES } from '@wezon/wz-grid-core';

// ── CSS ───────────────────────────────────────────────────────────────────────
import './lib.css';
