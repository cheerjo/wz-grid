// packages/vue/src/composables/useSelection.ts
import { ref, reactive } from 'vue-demi';
import type { Selection } from '@anthropic/wz-grid-core';

export function useSelection() {
  const selection = reactive<Selection>({
    startRow: -1,
    startCol: -1,
    endRow: -1,
    endCol: -1
  });

  const isDragging = ref(false);

  const startSelection = (row: number, col: number) => {
    selection.startRow = row;
    selection.startCol = col;
    selection.endRow = row;
    selection.endCol = col;
    isDragging.value = true;
  };

  const updateSelection = (row: number, col: number) => {
    if (isDragging.value) {
      selection.endRow = row;
      selection.endCol = col;
    }
  };

  const endSelection = () => {
    isDragging.value = false;
  };

  const clearSelection = () => {
    selection.startRow = -1;
    selection.startCol = -1;
    selection.endRow = -1;
    selection.endCol = -1;
  };

  const isSelected = (row: number, col: number) => {
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    return (
      row >= minRow && row <= maxRow &&
      col >= minCol && col <= maxCol &&
      selection.startRow !== -1
    );
  };

  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right', shift: boolean, maxRow: number, maxCol: number) => {
    if (selection.startRow === -1) return;

    let targetRow = shift ? selection.endRow : selection.startRow;
    let targetCol = shift ? selection.endCol : selection.startCol;

    if (direction === 'up') targetRow = Math.max(0, targetRow - 1);
    else if (direction === 'down') targetRow = Math.min(maxRow - 1, targetRow + 1);
    else if (direction === 'left') targetCol = Math.max(0, targetCol - 1);
    else if (direction === 'right') targetCol = Math.min(maxCol - 1, targetCol + 1);

    if (shift) {
      selection.endRow = targetRow;
      selection.endCol = targetCol;
    } else {
      selection.startRow = targetRow;
      selection.startCol = targetCol;
      selection.endRow = targetRow;
      selection.endCol = targetCol;
    }
  };

  return {
    selection,
    startSelection,
    updateSelection,
    endSelection,
    isSelected,
    clearSelection,
    moveSelection
  };
}
