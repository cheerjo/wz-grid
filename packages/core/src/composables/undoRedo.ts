// packages/core/src/composables/undoRedo.ts
// No Vue dependency — pure TypeScript

/**
 * Undo/Redo 히스토리의 단위 항목 — 셀 편집 한 건.
 */
export interface HistoryEntry<T extends Record<string, any> = Record<string, any>> {
  rowId: string | number;
  colKey: keyof T & string;
  oldValue: unknown;
  newValue: unknown;
}

export interface UndoRedoEngine<T extends Record<string, any> = Record<string, any>> {
  canUndo: () => boolean;
  canRedo: () => boolean;
  undoSize: () => number;
  redoSize: () => number;
  push: (entry: HistoryEntry<T>) => void;
  undo: () => HistoryEntry<T> | null;
  redo: () => HistoryEntry<T> | null;
  clear: () => void;
}

export function createUndoRedoEngine<T extends Record<string, any> = Record<string, any>>(
  getMaxDepth: () => number,
): UndoRedoEngine<T> {
  let undoStack: HistoryEntry<T>[] = [];
  let redoStack: HistoryEntry<T>[] = [];

  const canUndo = () => undoStack.length > 0;
  const canRedo = () => redoStack.length > 0;
  const undoSize = () => undoStack.length;
  const redoSize = () => redoStack.length;

  const push = (entry: HistoryEntry<T>) => {
    const maxDepth = Math.max(0, getMaxDepth() | 0);
    if (maxDepth === 0) {
      undoStack = [];
      redoStack = [];
      return;
    }
    redoStack = [];
    undoStack.push(entry);
    while (undoStack.length > maxDepth) undoStack.shift();
  };

  const undo = (): HistoryEntry<T> | null => {
    if (undoStack.length === 0) return null;
    const entry = undoStack.pop() as HistoryEntry<T>;
    redoStack.push(entry);
    return entry;
  };

  const redo = (): HistoryEntry<T> | null => {
    if (redoStack.length === 0) return null;
    const entry = redoStack.pop() as HistoryEntry<T>;
    undoStack.push(entry);
    return entry;
  };

  const clear = () => {
    undoStack = [];
    redoStack = [];
  };

  return { canUndo, canRedo, undoSize, redoSize, push, undo, redo, clear };
}
