// packages/vue/src/composables/useMerge.ts
import { computed } from 'vue-demi';
import type { Column, GridItem, MergeState, MergeRowSpan } from '@wezon/wz-grid-core';

type MergeCellsFn = (row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void;

// MergeRowSpan은 코어에서 re-export됨
export type { MergeRowSpan };

export function useMerge(
  getPagedItems: () => GridItem[],
  getVisibleColumns: () => Column[],
  getAutoMergeCols: () => string[],
  getMergeCellsFn: () => MergeCellsFn | null
) {
  const hasActiveMerge = computed(() => (getAutoMergeCols()?.length ?? 0) > 0 || !!getMergeCellsFn());

  const _computation = computed((): { cells: Record<string, MergeState>; spans: Record<number, MergeRowSpan> } => {
    const cells: Record<string, MergeState> = {};
    const spans: Record<number, MergeRowSpan> = {};
    if (!hasActiveMerge.value) return { cells, spans };

    const cols = getVisibleColumns();
    const colIdxByKey = new Map<string, number>();
    cols.forEach((c, i) => colIdxByKey.set(c.key, i));

    const dataEntries: Array<{ itemIdx: number; row: any }> = [];
    getPagedItems().forEach((item, itemIdx) => {
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

    // 1) autoMergeCols: 같은 값을 가진 인접 행을 자동 병합
    for (const colKey of (getAutoMergeCols() || [])) {
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
    const mergeCellsFn = getMergeCellsFn();
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
  });

  const mergeMap = computed(() => _computation.value.cells);

  const getMerge = (itemIdx: number, colKey: string): MergeState | undefined =>
    mergeMap.value[`${itemIdx}:${colKey}`];

  const getMergeSpan = (itemIdx: number): MergeRowSpan | null =>
    _computation.value.spans[itemIdx] ?? null;

  return { hasActiveMerge, getMerge, getMergeSpan };
}
