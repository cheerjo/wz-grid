// packages/vue/src/composables/useClipboard.ts
import type { Selection, Column } from '@wezon/wz-grid-core';
import { parseTSV, stringifyTSV } from '@wezon/wz-grid-core';

export function useClipboard(
  selection: Selection,
  getColumns: () => Column[],
  getRows: () => any[],
  updateCell: (rowIdx: number, colKey: string, value: any) => void
) {
  const getCols = getColumns;
  const getRows_ = getRows;

  const onCopy = (e: ClipboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    const selectedData: string[][] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const rowData: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        const col = getCols()[c];
        rowData.push(col ? String(getRows_()[r]?.[col.key] ?? '') : '');
      }
      selectedData.push(rowData);
    }

    e.clipboardData?.setData('text/plain', stringifyTSV(selectedData));
    e.preventDefault();
  };

  const onPaste = (e: ClipboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const tsvData = e.clipboardData?.getData('text/plain');
    if (!tsvData) return;

    const parsed = parseTSV(tsvData);
    const startRow = Math.min(selection.startRow, selection.endRow);
    const startCol = Math.min(selection.startCol, selection.endCol);

    const READ_ONLY_TYPES = new Set(['badge', 'progress', 'image', 'button', 'link', 'tag', 'sparkline']);

    parsed.forEach((rowData, rIdx) => {
      rowData.forEach((cellData, cIdx) => {
        const targetRow = startRow + rIdx;
        const targetCol = startCol + cIdx;
        const col = getCols()[targetCol];
        if (targetRow < getRows_().length && col && !READ_ONLY_TYPES.has(col.type || '')) {
          updateCell(targetRow, col.key, cellData);
        }
      });
    });
    e.preventDefault();
  };

  return { onCopy, onPaste };
}
