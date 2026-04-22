// packages/core/src/composables/clipboard.ts
// No Vue dependency — pure TypeScript
// DOM API(ClipboardEvent)는 타입으로만 사용하며, 런타임 DOM 접근은 주입 함수로 위임.
import type { Selection, Column } from '../types/grid';
import { parseTSV, stringifyTSV } from '../utils/tsv';

/** 읽기 전용 컬럼 타입 (붙여넣기 차단 대상) */
export const CLIPBOARD_READ_ONLY_TYPES = new Set([
  'badge', 'progress', 'image', 'button', 'link', 'tag', 'sparkline',
]);

/**
 * 현재 selection 범위의 셀 데이터를 TSV 문자열로 직렬화.
 * 편집 중인 input/select/textarea에서의 복사는 null을 반환해 기본 동작에 위임.
 */
export function buildCopyText(
  selection: Selection,
  columns: Column[],
  rows: any[],
  activeTagName: string | null
): string | null {
  if (activeTagName === 'INPUT' || activeTagName === 'TEXTAREA' || activeTagName === 'SELECT') {
    return null;
  }

  const minRow = Math.min(selection.startRow, selection.endRow);
  const maxRow = Math.max(selection.startRow, selection.endRow);
  const minCol = Math.min(selection.startCol, selection.endCol);
  const maxCol = Math.max(selection.startCol, selection.endCol);

  const selectedData: string[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    const rowData: string[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      const col = columns[c];
      rowData.push(col ? String(rows[r]?.[col.key] ?? '') : '');
    }
    selectedData.push(rowData);
  }

  return stringifyTSV(selectedData);
}

/**
 * TSV 문자열을 파싱해 붙여넣기 대상 셀 목록 반환.
 * 편집 중인 input/select/textarea에서의 붙여넣기는 null 반환 (기본 동작 위임).
 */
export function parsePasteData(
  tsvText: string | null | undefined,
  selection: Selection,
  columns: Column[],
  totalRows: number,
  activeTagName: string | null
): Array<{ rowIdx: number; colKey: string; value: string }> | null {
  if (activeTagName === 'INPUT' || activeTagName === 'TEXTAREA' || activeTagName === 'SELECT') {
    return null;
  }
  if (!tsvText) return null;

  const parsed = parseTSV(tsvText);
  const startRow = Math.min(selection.startRow, selection.endRow);
  const startCol = Math.min(selection.startCol, selection.endCol);
  const result: Array<{ rowIdx: number; colKey: string; value: string }> = [];

  parsed.forEach((rowData, rIdx) => {
    rowData.forEach((cellData, cIdx) => {
      const targetRow = startRow + rIdx;
      const targetCol = startCol + cIdx;
      const col = columns[targetCol];
      if (targetRow < totalRows && col && !CLIPBOARD_READ_ONLY_TYPES.has(col.type || '')) {
        result.push({ rowIdx: targetRow, colKey: col.key, value: cellData });
      }
    });
  });

  return result;
}
