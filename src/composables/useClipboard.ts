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

    // NON_EDITABLE_TYPES에서 클릭 토글 타입(boolean, radio, rating, color)을 제외한 읽기 전용 타입.
    // 클릭 토글 타입은 셀 값 자체는 변경 가능하므로 붙여넣기 차단 대상에서 제외한다.
    // tag는 배열 값이고 sparkline도 숫자 배열이므로 문자열 붙여넣기 시 데이터가 깨진다.
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
