// src/composables/useUndoRedo.ts
import { computed, ref } from 'vue-demi';
import type { ComputedRef } from 'vue-demi';

/**
 * Undo/Redo 히스토리의 단위 항목 — 셀 편집 한 건.
 *
 * - WZGrid는 단방향 데이터 흐름을 유지하기 위해 `rows`를 직접 mutate 하지 않습니다.
 *   되돌리기/다시 실행 시 같은 entry를 바탕으로 `@update:cell` 이벤트를 **역방향/재방향**
 *   값으로 재 emit 하여 부모 컴포넌트가 실제 데이터를 복구/재적용 하도록 합니다.
 */
export interface HistoryEntry<T extends Record<string, any> = Record<string, any>> {
  /** 편집 대상 행의 id */
  rowId: string | number;
  /** 편집 대상 컬럼 key */
  colKey: keyof T & string;
  /** 편집 직전 값 (undo 시 복구할 값) */
  oldValue: unknown;
  /** 편집 직후 값 (redo 시 재적용할 값) */
  newValue: unknown;
}

export interface UseUndoRedoOptions {
  /** 히스토리 최대 depth. 초과 시 오래된 entry가 FIFO로 제거됩니다. 기본 50. */
  getMaxDepth: () => number;
}

export interface UseUndoRedoReturn<T extends Record<string, any> = Record<string, any>> {
  /** 현재 Undo 가능 여부 */
  canUndo: ComputedRef<boolean>;
  /** 현재 Redo 가능 여부 */
  canRedo: ComputedRef<boolean>;
  /** Undo 스택의 크기 (디버깅/UI 용) */
  undoSize: ComputedRef<number>;
  /** Redo 스택의 크기 (디버깅/UI 용) */
  redoSize: ComputedRef<number>;
  /**
   * 새 편집 항목을 Undo 스택에 push 합니다.
   * push 시 Redo 스택은 자동으로 비워집니다 (분기 변경 시 기존 redo는 무효).
   * maxDepth 초과 시 가장 오래된 항목을 FIFO로 제거합니다.
   */
  push: (entry: HistoryEntry<T>) => void;
  /** Undo: 마지막 항목을 pop 하고 Redo 스택에 이동. 없으면 null 반환. */
  undo: () => HistoryEntry<T> | null;
  /** Redo: 마지막 Undo 항목을 pop 하고 Undo 스택에 이동. 없으면 null 반환. */
  redo: () => HistoryEntry<T> | null;
  /** Undo / Redo 스택을 모두 비웁니다. */
  clear: () => void;
}

/**
 * 셀 편집 Undo/Redo 히스토리 composable.
 *
 * @example
 * const { push, undo, redo, canUndo, canRedo } = useUndoRedo({ getMaxDepth: () => 50 });
 * // 편집 확정 시
 * push({ rowId: row.id, colKey: 'salary', oldValue: 5000, newValue: 5500 });
 * // Ctrl+Z
 * const entry = undo();
 * if (entry) emit('update:cell', { rowId: entry.rowId, colKey: entry.colKey, value: entry.oldValue });
 */
export function useUndoRedo<T extends Record<string, any> = Record<string, any>>(
  opts: UseUndoRedoOptions,
): UseUndoRedoReturn<T> {
  const undoStack = ref<HistoryEntry<T>[]>([]) as { value: HistoryEntry<T>[] };
  const redoStack = ref<HistoryEntry<T>[]>([]) as { value: HistoryEntry<T>[] };

  const push = (entry: HistoryEntry<T>) => {
    const maxDepth = Math.max(0, opts.getMaxDepth() | 0);
    if (maxDepth === 0) {
      undoStack.value = [];
      redoStack.value = [];
      return;
    }
    // 분기 변경: 새 편집이 들어오면 이후 redo는 의미를 잃음
    redoStack.value = [];
    undoStack.value.push(entry);
    // FIFO drain
    while (undoStack.value.length > maxDepth) undoStack.value.shift();
  };

  const undo = (): HistoryEntry<T> | null => {
    if (undoStack.value.length === 0) return null;
    const entry = undoStack.value.pop() as HistoryEntry<T>;
    redoStack.value.push(entry);
    return entry;
  };

  const redo = (): HistoryEntry<T> | null => {
    if (redoStack.value.length === 0) return null;
    const entry = redoStack.value.pop() as HistoryEntry<T>;
    undoStack.value.push(entry);
    return entry;
  };

  const clear = () => {
    undoStack.value = [];
    redoStack.value = [];
  };

  return {
    canUndo: computed(() => undoStack.value.length > 0),
    canRedo: computed(() => redoStack.value.length > 0),
    undoSize: computed(() => undoStack.value.length),
    redoSize: computed(() => redoStack.value.length),
    push,
    undo,
    redo,
    clear,
  };
}
