// packages/core/src/index.ts
// WZ-Grid Headless Core — Pure TypeScript, no framework dependency

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  ColumnType,
  Align,
  GridRow,
  FooterAggr,
  ColumnCellValue,
  Column,
  Locale,
  Messages,
  CellUpdateEvent,
  SortConfig,
  SortChangeEvent,
  FilterChangeEvent,
  SelectionChangeEvent,
  PagingChangeEvent,
  CheckedChangeEvent,
  CellSlotProps,
  DetailSlotProps,
  GridData,
  _WZGridPropNamingGuide,
  WZGridDeprecatedProps,
  Selection,
  DataItem,
  GroupHeader,
  SubtotalItem,
  GridItem,
  MergeState,
} from './types/grid';

// Runtime value (not a type)
export { NON_EDITABLE_TYPES } from './types/grid';

export type {
  PluginHook,
  PluginCallback,
  PluginHookData,
  PluginContext,
  WZGridPlugin,
} from './types/plugin';

// ─── Utils ───────────────────────────────────────────────────────────────────
export type { ExportCSVOptions } from './utils/csv';
export { escapeCSVField, toCSV, exportCSV } from './utils/csv';

export { parseTSV, stringifyTSV, downloadCSV } from './utils/tsv';

export type { ExcelExportOptions } from './utils/excel';
export { exportExcel } from './utils/excel';

export { printGrid } from './utils/print';

// ─── Composables (pure TS, no Vue dependency) ─────────────────────────────────

// sort
export type { SortState, SortEngine } from './composables/sort';
export { compareValues, compareByColumn, sortRows, computeToggleSort, createSortEngine } from './composables/sort';

// filter
export type { FilterValue, FiltersMap, FilterEngine } from './composables/filter';
export {
  createInitialFilter, isFilterActive, clearFilter, clearAllFilters,
  initFilters, filterRows, countActiveFilters, createFilterEngine,
} from './composables/filter';

// tree
export type { TreeEngine } from './composables/tree';
export { buildVisibleIds, flattenTree, collectParentIds, createTreeEngine } from './composables/tree';

// grouping
export type { GroupingEngine } from './composables/grouping';
export { getGroupLabel, buildGroupedItems, createGroupingEngine } from './composables/grouping';

// merge
export type { MergeRowSpan, MergeComputation } from './composables/merge';
export { computeMerge, getMerge, getMergeSpan } from './composables/merge';

// virtualScroll
export type { VirtualScrollRange, VirtualScrollPadding, VirtualScrollEngine } from './composables/virtualScroll';
export { computeVisibleRange, computePadding, createVirtualScrollEngine } from './composables/virtualScroll';

// i18n
export type { TFunction } from './composables/i18n';
export { buildTranslations, translate, createI18nEngine, I18N_KEY } from './composables/i18n';

// clipboard
export { CLIPBOARD_READ_ONLY_TYPES, buildCopyText, parsePasteData } from './composables/clipboard';

// selection
export type { SelectionEngine } from './composables/selection';
export { createSelectionEngine } from './composables/selection';

// checkbox
export type { CheckboxState, CheckboxEngine } from './composables/checkbox';
export { createCheckboxEngine } from './composables/checkbox';

// undoRedo
export type { HistoryEntry, UndoRedoEngine } from './composables/undoRedo';
export { createUndoRedoEngine } from './composables/undoRedo';

// columnDrag
export type { ColumnDragState, ColumnDragEngine } from './composables/columnDrag';
export { createColumnDragEngine } from './composables/columnDrag';

// rowDragDrop
export type { RowDragState, RowDragDropEngine } from './composables/rowDragDrop';
export { createRowDragDropEngine } from './composables/rowDragDrop';

// columnSettings
export type { ColumnSettingsEngine } from './composables/columnSettings';
export { createColumnSettingsEngine } from './composables/columnSettings';

// validation
export type { ErrorsMap, ValidationEngine } from './composables/validation';
export { validateCellValue, runStructureValidation, createValidationEngine } from './composables/validation';

// plugins
export type { PluginEngine } from './composables/plugins';
export { createPluginEngine } from './composables/plugins';

// performance
export type { PerfEntry, PerformanceEngine } from './composables/performance';
export { createPerformanceEngine } from './composables/performance';

// i18n locale data
export { ko } from './i18n/ko';
export type { KoMessages } from './i18n/ko';
export { en } from './i18n/en';
