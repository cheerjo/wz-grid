// packages/vue/src/index.ts
import './lib.css';

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export { default as WZGrid } from './components/WZGrid.vue';

// ─── 코어 타입/유틸 re-export ─────────────────────────────────────────────────
export * from '@wezon/wz-grid-core';

// ─── Vue 컴포저블 (Vue 반응형 상태 포함) ────────────────────────────────────────
// 코어와 이름 충돌이 없는 것들만 * re-export
export { useSort } from './composables/useSort';
export type { UseSortReturn } from './composables/useSort';
export { useFilter } from './composables/useFilter';
export type { UseFilterReturn } from './composables/useFilter';
export { useTree } from './composables/useTree';
export type { UseTreeReturn } from './composables/useTree';
export { useGrouping } from './composables/useGrouping';
export { useMerge } from './composables/useMerge';
export { useVirtualScroll } from './composables/useVirtualScroll';
export { useSelection } from './composables/useSelection';
export { useCheckbox } from './composables/useCheckbox';
export type { UseCheckboxReturn } from './composables/useCheckbox';
export { useColumnDrag } from './composables/useColumnDrag';
export { useRowDragDrop } from './composables/useRowDragDrop';
export { useUndoRedo } from './composables/useUndoRedo';
export type { UseUndoRedoOptions, UseUndoRedoReturn } from './composables/useUndoRedo';
export { useClipboard } from './composables/useClipboard';
export { useColumnSettings } from './composables/useColumnSettings';
export { useValidation } from './composables/useValidation';
export type { UseValidationReturn } from './composables/useValidation';
export { useI18n } from './composables/useI18n';
export { usePlugins } from './composables/usePlugins';
export { usePerformance } from './composables/usePerformance';
export type { UsePerformanceReturn } from './composables/usePerformance';
export { useFocusTrap } from './composables/useFocusTrap';
export type { UseFocusTrapOptions } from './composables/useFocusTrap';
