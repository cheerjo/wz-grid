// packages/react/src/hooks/useUndoRedo.ts
import { useState, useCallback, useRef } from 'react';
import { createUndoRedoEngine } from '@wezon/wz-grid-core';
import type { UndoRedoEngine, HistoryEntry } from '@wezon/wz-grid-core';

export interface UseUndoRedoReturn {
  /** Undo 가능 여부 */
  canUndo: boolean;
  /** Redo 가능 여부 */
  canRedo: boolean;
  /** 히스토리 항목 추가 */
  push: (entry: HistoryEntry) => void;
  /** Undo 실행. 복원할 항목 반환, 없으면 null. */
  undo: () => HistoryEntry | null;
  /** Redo 실행. 복원할 항목 반환, 없으면 null. */
  redo: () => HistoryEntry | null;
  /** 히스토리 초기화 */
  clear: () => void;
}

export function useUndoRedo(maxDepth = 50): UseUndoRedoReturn {
  const engineRef = useRef<UndoRedoEngine>(
    createUndoRedoEngine(() => maxDepth)
  );
  const [, forceUpdate] = useState(0);

  const tick = () => forceUpdate(n => n + 1);

  const push = useCallback((entry: HistoryEntry) => {
    engineRef.current.push(entry);
    tick();
  }, []);

  const undo = useCallback((): HistoryEntry | null => {
    const entry = engineRef.current.undo();
    tick();
    return entry;
  }, []);

  const redo = useCallback((): HistoryEntry | null => {
    const entry = engineRef.current.redo();
    tick();
    return entry;
  }, []);

  const clear = useCallback(() => {
    engineRef.current.clear();
    tick();
  }, []);

  return {
    canUndo: engineRef.current.canUndo(),
    canRedo: engineRef.current.canRedo(),
    push,
    undo,
    redo,
    clear,
  };
}
