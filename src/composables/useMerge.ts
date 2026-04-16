// src/composables/useMerge.ts
import { computed } from 'vue-demi';
import { Column, GridItem, MergeState } from '../types/grid';

type MergeCellsFn = (row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void;

/**
 * 셀 병합 컴포저블.
 *
 * ## 동작 개요
 * - `mergeMap`은 `getPagedItems()`를 의존으로 삼는 computed이므로,
 *   정렬/필터/페이징이 바뀌면 자동 재계산됩니다.
 * - 키 포맷은 `"<pagedItems 인덱스>:<column key>"` 입니다. `WZGridRow`에서
 *   전달하는 `itemIdx`도 동일 기준이므로 정상 매칭됩니다.
 *
 * ## 한계 및 주의
 * - **병합 범위는 현재 페이지 안에서만 유효합니다.** `mergeCells` 콜백이
 *   페이지 경계를 넘는 rowspan을 반환해도 해당 페이지 안의 행까지만 숨김
 *   처리됩니다. 페이지 경계에 걸친 병합이 필요하면 `usePaging=false` 또는
 *   `pageSize`를 충분히 크게 잡아야 합니다.
 * - `autoMergeCols`로 큰 연속 블록을 만들면 가상 스크롤이 비활성화되어
 *   대량 데이터에서 성능 저하가 있을 수 있습니다. `WZGrid.vue`의
 *   `hasActiveMerge` 분기 참조.
 */
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
    const colIdxByKey = new Map<string, number>();
    cols.forEach((c, i) => colIdxByKey.set(c.key, i));

    const dataEntries: Array<{ itemIdx: number; row: any }> = [];
    getPagedItems().forEach((item, itemIdx) => {
      if (item.type === 'data') dataEntries.push({ itemIdx, row: item.row });
    });

    const keyFor = (itemIdx: number, colKey: string) => `${itemIdx}:${colKey}`;
    const markHidden = (itemIdx: number, colKey: string) => {
      map[keyFor(itemIdx, colKey)] = { rowspan: 1, colspan: 1, hidden: true };
    };

    // 1) autoMergeCols: 같은 값을 가진 인접 행을 자동 병합
    for (const colKey of (getAutoMergeCols() || [])) {
      if (!colIdxByKey.has(colKey)) continue; // 숨겨진/존재하지 않는 컬럼은 무시
      let i = 0;
      while (i < dataEntries.length) {
        const val = dataEntries[i].row[colKey];
        let j = i + 1;
        while (j < dataEntries.length && dataEntries[j].row[colKey] === val) j++;
        if (j - i > 1) {
          map[keyFor(dataEntries[i].itemIdx, colKey)] = { rowspan: j - i, colspan: 1, hidden: false };
          for (let k = i + 1; k < j; k++) markHidden(dataEntries[k].itemIdx, colKey);
        }
        i = j;
      }
    }

    // 2) mergeCells 콜백: 커스텀 병합 (autoMerge보다 우선)
    const mergeCellsFn = getMergeCellsFn();
    if (mergeCellsFn) {
      dataEntries.forEach(({ itemIdx, row }, dataIdx) => {
        cols.forEach((col, colIdx) => {
          const key = keyFor(itemIdx, col.key);
          if (map[key]?.hidden) return;
          const merge = mergeCellsFn(row, col.key);
          if (!merge) return;
          // 음수/0 방어 + 페이지 범위로 클램프 (경계 넘는 범위는 조용히 잘라냄)
          const rowspan = Math.max(1, Math.min(merge.rowspan ?? 1, dataEntries.length - dataIdx));
          const colspan = Math.max(1, Math.min(merge.colspan ?? 1, cols.length - colIdx));
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
