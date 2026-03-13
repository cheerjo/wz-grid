// src/composables/useMerge.ts
import { computed } from 'vue-demi';
import { Column, GridItem, MergeState } from '../types/grid';

type MergeCellsFn = (row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void;

export function useMerge(
  getPagedItems: () => GridItem[],
  getVisibleColumns: () => Column[],
  getAutoMergeCols: () => string[],
  getMergeCellsFn: () => MergeCellsFn | null
) {
  const hasActiveMerge = computed(() => (getAutoMergeCols()?.length ?? 0) > 0 || !!getMergeCellsFn());

  const mergeMap = computed((): Record<string, MergeState> => {
    if (!hasActiveMerge.value) return {};
    const map: Record<string, MergeState> = {};
    const cols = getVisibleColumns();

    const dataEntries: Array<{ itemIdx: number; row: any }> = [];
    getPagedItems().forEach((item, itemIdx) => {
      if (item.type === 'data') dataEntries.push({ itemIdx, row: item.row });
    });

    const markHidden = (itemIdx: number, colKey: string) => {
      map[`${itemIdx}:${colKey}`] = { rowspan: 1, colspan: 1, hidden: true };
    };

    // autoMergeCols: 같은 값을 가진 인접 행 자동 병합
    for (const colKey of (getAutoMergeCols() || [])) {
      let i = 0;
      while (i < dataEntries.length) {
        const val = dataEntries[i].row[colKey];
        let j = i + 1;
        while (j < dataEntries.length && dataEntries[j].row[colKey] === val) j++;
        if (j - i > 1) {
          map[`${dataEntries[i].itemIdx}:${colKey}`] = { rowspan: j - i, colspan: 1, hidden: false };
          for (let k = i + 1; k < j; k++) markHidden(dataEntries[k].itemIdx, colKey);
        }
        i = j;
      }
    }

    // mergeCells 콜백: 커스텀 병합
    const mergeCellsFn = getMergeCellsFn();
    if (mergeCellsFn) {
      dataEntries.forEach(({ itemIdx, row }, dataIdx) => {
        cols.forEach((col, colIdx) => {
          const key = `${itemIdx}:${col.key}`;
          if (map[key]?.hidden) return;
          const merge = mergeCellsFn(row, col.key);
          if (!merge) return;
          const rowspan = merge.rowspan ?? 1;
          const colspan = merge.colspan ?? 1;
          if (rowspan === 1 && colspan === 1) return;
          map[key] = { rowspan, colspan, hidden: false };
          for (let dr = 0; dr < rowspan; dr++) {
            for (let dc = 0; dc < colspan; dc++) {
              if (dr === 0 && dc === 0) continue;
              const ci = dataIdx + dr;
              const cc = colIdx + dc;
              if (ci < dataEntries.length && cc < cols.length)
                markHidden(dataEntries[ci].itemIdx, cols[cc].key);
            }
          }
        });
      });
    }

    return map;
  });

  const getMerge = (itemIdx: number, colKey: string): MergeState | undefined =>
    mergeMap.value[`${itemIdx}:${colKey}`];

  return { hasActiveMerge, getMerge };
}
