// packages/core/src/composables/selection.ts
// No Vue dependency — pure TypeScript
import type { Selection } from '../types/grid';

export interface SelectionEngine {
  getSelection: () => Selection;
  startSelection: (row: number, col: number) => void;
  updateSelection: (row: number, col: number) => void;
  endSelection: () => void;
  clearSelection: () => void;
  isSelected: (row: number, col: number) => boolean;
  moveSelection: (direction: 'up' | 'down' | 'left' | 'right', shift: boolean, maxRow: number, maxCol: number) => void;
  isDragging: () => boolean;
}

export function createSelectionEngine(): SelectionEngine {
  let selection: Selection = { startRow: -1, startCol: -1, endRow: -1, endCol: -1 };
  let dragging = false;

  const getSelection = () => ({ ...selection });
  const isDragging = () => dragging;

  const startSelection = (row: number, col: number) => {
    selection = { startRow: row, startCol: col, endRow: row, endCol: col };
    dragging = true;
  };

  const updateSelection = (row: number, col: number) => {
    if (!dragging) return;
    selection = { ...selection, endRow: row, endCol: col };
  };

  const endSelection = () => { dragging = false; };

  const clearSelection = () => {
    selection = { startRow: -1, startCol: -1, endRow: -1, endCol: -1 };
  };

  const isSelected = (row: number, col: number): boolean => {
    if (selection.startRow === -1) return false;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const moveSelection = (
    direction: 'up' | 'down' | 'left' | 'right',
    shift: boolean,
    maxRow: number,
    maxCol: number
  ) => {
    if (selection.startRow === -1) return;

    let targetRow = shift ? selection.endRow : selection.startRow;
    let targetCol = shift ? selection.endCol : selection.startCol;

    if (direction === 'up')    targetRow = Math.max(0, targetRow - 1);
    else if (direction === 'down')  targetRow = Math.min(maxRow - 1, targetRow + 1);
    else if (direction === 'left')  targetCol = Math.max(0, targetCol - 1);
    else if (direction === 'right') targetCol = Math.min(maxCol - 1, targetCol + 1);

    if (shift) {
      selection = { ...selection, endRow: targetRow, endCol: targetCol };
    } else {
      selection = { startRow: targetRow, startCol: targetCol, endRow: targetRow, endCol: targetCol };
    }
  };

  return { getSelection, isDragging, startSelection, updateSelection, endSelection, clearSelection, isSelected, moveSelection };
}
