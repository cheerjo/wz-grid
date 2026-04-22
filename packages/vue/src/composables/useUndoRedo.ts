// packages/vue/src/composables/useUndoRedo.ts
import { computed, ref } from 'vue-demi';
import type { ComputedRef } from 'vue-demi';
import type { HistoryEntry } from '@wezon/wz-grid-core';

// HistoryEntry는 코어에서 re-export됨
export type { HistoryEntry };

export interface UseUndoRedoOptions {
  getMaxDepth: () => number;
}

export interface UseUndoRedoReturn<T extends Record<string, any> = Record<string, any>> {
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  undoSize: ComputedRef<number>;
  redoSize: ComputedRef<number>;
  push: (entry: HistoryEntry<T>) => void;
  undo: () => HistoryEntry<T> | null;
  redo: () => HistoryEntry<T> | null;
  clear: () => void;
}

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
    redoStack.value = [];
    undoStack.value.push(entry);
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
