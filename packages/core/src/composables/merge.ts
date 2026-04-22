// packages/core/src/composables/merge.ts
// No Vue dependency — pure TypeScript
import type { Column, GridItem, MergeState } from '../types/grid';

type MergeCellsFn = (row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void;

/**
 * 행(아이템 인덱스)이 속한 가장 넓은 병합 블록의 범위.
 * `[start, end)` — end는 exclusive.
 */
export interface MergeRowSpan {
  start: number;
  end: number;
}

export interface MergeComputation {
  cells: Record<string, MergeState>;
  spans: Record<number, MergeRowSpan>;
}

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/**
 * pagedItems + 설정으로 MergeComputation을 계산.
 * cells: `"itemIdx:colKey"` → MergeState
 * spans: `itemIdx` → MergeRowSpan
 */
export function computeMerge(
  pagedItems: GridItem[],
  visibleColumns: Column[],
  autoMergeCols: string[],
  mergeCellsFn: MergeCellsFn | null
): MergeComputation {
  const cells: Record<string, MergeState> = {};
  const spans: Record<number, MergeRowSpan> = {};

  const hasActiveMerge = (autoMergeCols?.length ?? 0) > 0 || !!mergeCellsFn;
  if (!hasActiveMerge) return { cells, spans };

  const cols = visibleColumns;
  const colIdxByKey = new Map<string, number>();
  cols.forEach((c, i) => colIdxByKey.set(c.key, i));

  const dataEntries: Array<{ itemIdx: number; row: any }> = [];
  pagedItems.forEach((item, itemIdx) => {
    if (item.type === 'data') dataEntries.push({ itemIdx, row: item.row });
  });

  const keyFor = (itemIdx: number, colKey: string) => `${itemIdx}:${colKey}`;
  const markHidden = (itemIdx: number, colKey: string) => {
    cells[keyFor(itemIdx, colKey)] = { rowspan: 1, colspan: 1, hidden: true };
  };

  const recordSpan = (startItemIdx: number, endItemIdxExclusive: number) => {
    for (let idx = startItemIdx; idx < endItemIdxExclusive; idx++) {
      const existing = spans[idx];
      if (!existing) {
        spans[idx] = { start: startItemIdx, end: endItemIdxExclusive };
      } else {
        if (startItemIdx < existing.start) existing.start = startItemIdx;
        if (endItemIdxExclusive > existing.end) existing.end = endItemIdxExclusive;
      }
    }
  };

  // 1) autoMergeCols
  for (const colKey of (autoMergeCols || [])) {
    if (!colIdxByKey.has(colKey)) continue;
    let i = 0;
    while (i < dataEntries.length) {
      const val = dataEntries[i].row[colKey];
      let j = i + 1;
      while (j < dataEntries.length && dataEntries[j].row[colKey] === val) j++;
      if (j - i > 1) {
        cells[keyFor(dataEntries[i].itemIdx, colKey)] = { rowspan: j - i, colspan: 1, hidden: false };
        for (let k = i + 1; k < j; k++) markHidden(dataEntries[k].itemIdx, colKey);
        recordSpan(dataEntries[i].itemIdx, dataEntries[j - 1].itemIdx + 1);
      }
      i = j;
    }
  }

  // 2) mergeCells 콜백
  if (mergeCellsFn) {
    dataEntries.forEach(({ itemIdx, row }, dataIdx) => {
      cols.forEach((col, colIdx) => {
        const k = keyFor(itemIdx, col.key);
        if (cells[k]?.hidden) return;
        const merge = mergeCellsFn(row, col.key);
        if (!merge) return;
        const rowspan = Math.max(1, Math.min(merge.rowspan ?? 1, dataEntries.length - dataIdx));
        const colspan = Math.max(1, Math.min(merge.colspan ?? 1, cols.length - colIdx));
        if (rowspan === 1 && colspan === 1) return;
        cells[k] = { rowspan, colspan, hidden: false };
        for (let dr = 0; dr < rowspan; dr++) {
          for (let dc = 0; dc < colspan; dc++) {
            if (dr === 0 && dc === 0) continue;
            const ci = dataIdx + dr;
            const cc = colIdx + dc;
            if (ci < dataEntries.length && cc < cols.length)
              markHidden(dataEntries[ci].itemIdx, cols[cc].key);
          }
        }
        if (rowspan > 1) {
          const startIdx = itemIdx;
          const endIdxExclusive = dataEntries[dataIdx + rowspan - 1].itemIdx + 1;
          recordSpan(startIdx, endIdxExclusive);
        }
      });
    });
  }

  return { cells, spans };
}

/** cells에서 특정 셀의 MergeState 반환 */
export function getMerge(computation: MergeComputation, itemIdx: number, colKey: string): MergeState | undefined {
  return computation.cells[`${itemIdx}:${colKey}`];
}

/** spans에서 특정 행의 MergeRowSpan 반환 */
export function getMergeSpan(computation: MergeComputation, itemIdx: number): MergeRowSpan | null {
  return computation.spans[itemIdx] ?? null;
}
