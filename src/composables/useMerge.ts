// src/composables/useMerge.ts
import { computed } from 'vue-demi';
import { Column, GridItem, MergeState } from '../types/grid';

type MergeCellsFn = (row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void;

/**
 * 행(아이템 인덱스)이 속한 **가장 넓은** 병합 블록의 범위.
 * `[startItemIdx, endItemIdx)` — end는 exclusive.
 *
 * 가상 스크롤이 `[vStart, vEnd]` 범위를 렌더할 때, 각 boundary 행에 대해
 * 이 span을 참조해 범위를 확장하면 병합 블록이 절단되지 않습니다.
 */
export interface MergeRowSpan {
  start: number;
  end: number;
}

/**
 * 셀 병합 컴포저블.
 *
 * ## 동작 개요
 * - `mergeMap`은 `getPagedItems()`를 의존으로 삼는 computed이므로,
 *   정렬/필터/페이징이 바뀌면 자동 재계산됩니다.
 * - 키 포맷은 `"<pagedItems 인덱스>:<column key>"` 입니다. `WZGridRow`에서
 *   전달하는 `itemIdx`도 동일 기준이므로 정상 매칭됩니다.
 * - 추가로 `getMergeSpan(itemIdx)`는 해당 행이 속한 병합 블록의 `[start, end)`
 *   범위를 반환합니다. 이 정보는 가상 스크롤이 병합 블록을 절단하지 않도록
 *   `visibleRowsRange`를 확장하는 데 사용됩니다.
 *
 * ## 한계 및 주의
 * - **병합 범위는 현재 페이지 안에서만 유효합니다.** `mergeCells` 콜백이
 *   페이지 경계를 넘는 rowspan을 반환해도 해당 페이지 안의 행까지만 숨김
 *   처리됩니다. 페이지 경계에 걸친 병합이 필요하면 `usePaging=false` 또는
 *   `pageSize`를 충분히 크게 잡아야 합니다.
 * - 병합과 가상 스크롤을 동시에 쓰려면 `virtualizeWithMerge: true` prop을
 *   활성화하세요(WZGrid). 기본값(false)에서는 병합이 활성이면 전체 행을
 *   렌더해 대량 데이터에서 성능 저하가 있을 수 있습니다.
 */
export function useMerge(
  getPagedItems: () => GridItem[],
  getVisibleColumns: () => Column[],
  getAutoMergeCols: () => string[],
  getMergeCellsFn: () => MergeCellsFn | null
) {
  const hasActiveMerge = computed(() => (getAutoMergeCols()?.length ?? 0) > 0 || !!getMergeCellsFn());

  /**
   * mergeMap 과 spanMap 을 한 번의 순회로 동시에 계산합니다.
   * 반환 구조: { cells: Record<"itemIdx:colKey", MergeState>, spans: Record<itemIdx, MergeRowSpan> }
   */
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

    // 병합 블록 span 누적: 항상 "더 넓은 범위"로 갱신 (가상 스크롤 확장 용도)
    const recordSpan = (startItemIdx: number, endItemIdxExclusive: number) => {
      for (let idx = startItemIdx; idx < endItemIdxExclusive; idx++) {
        const existing = spans[idx];
        if (!existing) {
          spans[idx] = { start: startItemIdx, end: endItemIdxExclusive };
        } else {
          // 더 넓게 확장 (min start / max end)
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
          // span 기록: 병합 블록의 양 끝 itemIdx
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

  /**
   * 주어진 `itemIdx` 가 속한 가장 넓은 병합 블록의 `[start, end)` 범위.
   * 병합이 없는 행은 `null` 반환.
   */
  const getMergeSpan = (itemIdx: number): MergeRowSpan | null =>
    _computation.value.spans[itemIdx] ?? null;

  return { hasActiveMerge, getMerge, getMergeSpan };
}
