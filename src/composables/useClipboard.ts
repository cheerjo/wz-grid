// src/composables/useClipboard.ts
import { Selection, Column } from '../types/grid';
import { parseTSV, stringifyTSV } from '../utils/tsv';

export function useClipboard(
  selection: Selection,
  getColumns: () => Column[],
  getRows: () => any[],
  updateCell: (rowIdx: number, colKey: string, value: any) => void
) {
  const getCols = getColumns;
  const getRows_ = getRows;

  const onCopy = (e: ClipboardEvent) => {
    // 편집 중인 input/select/textarea에서의 복사는 기본 동작에 위임
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
    // 편집 중인 input/select/textarea에서의 붙여넣기는 기본 동작에 위임
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const tsvData = e.clipboardData?.getData('text/plain');
    if (!tsvData) return;

    const parsed = parseTSV(tsvData);
    const startRow = Math.min(selection.startRow, selection.endRow);
    const startCol = Math.min(selection.startCol, selection.endCol);

    parsed.forEach((rowData, rIdx) => {
      rowData.forEach((cellData, cIdx) => {
        const targetRow = startRow + rIdx;
        const targetCol = startCol + cIdx;
        const col = getCols()[targetCol];
        if (targetRow < getRows_().length && col) {
          updateCell(targetRow, col.key, cellData);
        }
      });
    });
    e.preventDefault();
  };

  return { onCopy, onPaste };
}
