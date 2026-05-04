// packages/react/src/hooks/useSelection.ts
import { useState, useCallback, useRef } from 'react';
import { createSelectionEngine } from '@wezon/wz-grid-core';
import type { Selection, SelectionEngine } from '@wezon/wz-grid-core';

export interface UseSelectionReturn {
  /** 현재 셀 선택 범위 */
  selection: Selection;
  /** 마우스다운 → 선택 시작 */
  startSelection: (row: number, col: number) => void;
  /** 마우스이동 → 선택 확장 */
  updateSelection: (row: number, col: number) => void;
  /** 마우스업 → 선택 완료 */
  endSelection: () => void;
  /** 선택 해제 */
  clearSelection: () => void;
  /** 특정 셀이 선택 범위 안에 있는지 */
  isSelected: (row: number, col: number) => boolean;
  /** 키보드로 선택 이동 */
  moveSelection: (
    direction: 'up' | 'down' | 'left' | 'right',
    shift: boolean,
    maxRow: number,
    maxCol: number
  ) => void;
}

export function useSelection(): UseSelectionReturn {
  const engineRef = useRef<SelectionEngine>(createSelectionEngine());
  const [selection, setSelection] = useState<Selection>({
    startRow: -1,
    startCol: -1,
    endRow: -1,
    endCol: -1,
  });

  const sync = () => setSelection(engineRef.current.getSelection());

  const startSelection = useCallback((row: number, col: number) => {
    engineRef.current.startSelection(row, col);
    sync();
  }, []);

  const updateSelection = useCallback((row: number, col: number) => {
    engineRef.current.updateSelection(row, col);
    sync();
  }, []);

  const endSelection = useCallback(() => {
    engineRef.current.endSelection();
  }, []);

  const clearSelection = useCallback(() => {
    engineRef.current.clearSelection();
    sync();
  }, []);

  const isSelected = useCallback(
    (row: number, col: number) => engineRef.current.isSelected(row, col),
    [selection] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const moveSelection = useCallback(
    (
      direction: 'up' | 'down' | 'left' | 'right',
      shift: boolean,
      maxRow: number,
      maxCol: number
    ) => {
      engineRef.current.moveSelection(direction, shift, maxRow, maxCol);
      sync();
    },
    []
  );

  return {
    selection,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    isSelected,
    moveSelection,
  };
}
