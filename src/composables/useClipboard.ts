// src/composables/useClipboard.ts
import { Ref, unref } from 'vue-demi';
import { Selection, Column, GridData } from '../types/grid';
import { parseTSV, stringifyTSV } from '../utils/tsv';

export function useClipboard(
  selection: Selection,
  columns: Column[],
  // ComputedRef<any[]>도 받을 수 있도록 Ref 계열을 허용합니다.
  // unref()를 사용하면 Ref든 일반 값이든 모두 꺼낼 수 있습니다.
  rows: any[] | Ref<any[]>,
  updateCell: (rowIdx: number, colKey: string, value: any) => void
) {
  // 실제 사용 시점마다 최신 배열 값을 가져오는 헬퍼 함수
  const getRows = () => unref(rows);
  const onCopy = (e: ClipboardEvent) => {
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    const selectedData: string[][] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const rowData: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        const colKey = columns[c].key;
        rowData.push(getRows()[r][colKey] || '');
      }
      selectedData.push(rowData);
    }

    const tsvString = stringifyTSV(selectedData);
    e.clipboardData?.setData('text/plain', tsvString);
    e.preventDefault();
  };

  const onPaste = (e: ClipboardEvent) => {
    const tsvData = e.clipboardData?.getData('text/plain');
    if (!tsvData) return;

    const parsed = parseTSV(tsvData);
    const startRow = Math.min(selection.startRow, selection.endRow);
    const startCol = Math.min(selection.startCol, selection.endCol);

    parsed.forEach((rowData, rIdx) => {
      rowData.forEach((cellData, cIdx) => {
        const targetRow = startRow + rIdx;
        const targetCol = startCol + cIdx;

        if (targetRow < getRows().length && targetCol < columns.length) {
          updateCell(targetRow, columns[targetCol].key, cellData);
        }
      });
    });
    e.preventDefault();
  };

  return { onCopy, onPaste };
}
