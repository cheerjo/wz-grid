// packages/core/src/composables/columnDrag.ts
// No Vue dependency — pure TypeScript
import type { Column } from '../types/grid';

export interface ColumnDragState {
  dragSourceColIdx: number;
  dragOverColIdx: number;
  /** 내부적으로 관리하는 컬럼 순서 (key 배열). 비어있으면 원본 순서 사용. */
  internalOrder: string[];
}

export interface ColumnDragEngine {
  getState: () => ColumnDragState;
  onDragStart: (colIdx: number, isResizing: boolean) => boolean;
  onDragOver: (colIdx: number) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
  onDrop: (targetIdx: number, columns: Column[], onReorder: (srcKey: string, targetKey: string) => void) => void;
  /** 내부 순서가 적용된 컬럼 목록 반환 */
  reorderColumns: (columns: Column[]) => Column[];
}

export function createColumnDragEngine(): ColumnDragEngine {
  let state: ColumnDragState = {
    dragSourceColIdx: -1,
    dragOverColIdx: -1,
    internalOrder: [],
  };

  const getState = () => ({ ...state });

  const onDragStart = (colIdx: number, isResizing: boolean): boolean => {
    if (isResizing) return false;
    state = { ...state, dragSourceColIdx: colIdx };
    return true;
  };

  const onDragOver = (colIdx: number) => {
    if (colIdx !== state.dragSourceColIdx) {
      state = { ...state, dragOverColIdx: colIdx };
    }
  };

  const onDragLeave = () => { state = { ...state, dragOverColIdx: -1 }; };

  const onDragEnd = () => {
    state = { ...state, dragSourceColIdx: -1, dragOverColIdx: -1 };
  };

  const reorderColumns = (columns: Column[]): Column[] => {
    if (state.internalOrder.length === 0) return columns;
    const map = new Map(columns.map(c => [c.key, c]));
    const ordered = state.internalOrder.map(key => map.get(key)).filter(Boolean) as Column[];
    const orderedKeys = new Set(state.internalOrder);
    const newCols = columns.filter(c => !orderedKeys.has(c.key));
    return [...ordered, ...newCols];
  };

  const onDrop = (
    targetIdx: number,
    columns: Column[],
    onReorder: (srcKey: string, targetKey: string) => void
  ) => {
    const srcIdx = state.dragSourceColIdx;
    if (srcIdx === -1 || srcIdx === targetIdx) { onDragEnd(); return; }

    const currentCols = reorderColumns(columns);
    const srcKey    = currentCols[srcIdx]?.key;
    const targetKey = currentCols[targetIdx]?.key;
    if (!srcKey || !targetKey) { onDragEnd(); return; }

    const keys = currentCols.map(c => c.key);
    const si = keys.indexOf(srcKey);
    const [moved] = keys.splice(si, 1);
    const ti = keys.indexOf(targetKey);
    keys.splice(ti, 0, moved);

    state = { ...state, internalOrder: keys };
    onReorder(srcKey, targetKey);
    onDragEnd();
  };

  return { getState, onDragStart, onDragOver, onDragLeave, onDragEnd, onDrop, reorderColumns };
}
