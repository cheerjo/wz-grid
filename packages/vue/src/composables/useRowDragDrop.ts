// packages/vue/src/composables/useRowDragDrop.ts
// 행 드래그 앤 드롭 순서 변경 — 내부 상태 자체 관리 방식
import { ref, computed } from 'vue-demi';
import type { ComputedRef } from 'vue-demi';

export function useRowDragDrop(
  getRow: (idx: number) => any,
  onReorder: (from: any, to: any, position: 'above' | 'below') => void,
  getRows: () => any[]
) {
  const rowDragSrcIdx  = ref(-1);
  const rowDragOverIdx = ref(-1);
  const rowDragOverPos = ref<'above' | 'below'>('below');

  const internalRowOrder = ref<any[]>([]);

  const onRowDragStart = (itemIdx: number) => { rowDragSrcIdx.value = itemIdx; };

  const onRowDragOver = (e: DragEvent, itemIdx: number) => {
    if (itemIdx === rowDragSrcIdx.value) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    rowDragOverPos.value = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';
    rowDragOverIdx.value = itemIdx;
  };

  const onRowDrop = (e: DragEvent, itemIdx: number) => {
    e.preventDefault();
    const from = getRow(rowDragSrcIdx.value);
    const to   = getRow(itemIdx);
    if (from && to && from.id !== to.id) {
      const currentRows = reorderedRows.value;
      const ids = currentRows.map((r: any) => r.id);
      const fromIdx = ids.indexOf(from.id);
      if (fromIdx !== -1) {
        const [movedId] = ids.splice(fromIdx, 1);
        const toIdx = ids.indexOf(to.id);
        if (toIdx !== -1) {
          ids.splice(rowDragOverPos.value === 'above' ? toIdx : toIdx + 1, 0, movedId);
          internalRowOrder.value = ids;
        }
      }
      onReorder(from, to, rowDragOverPos.value);
    }
    rowDragSrcIdx.value = rowDragOverIdx.value = -1;
  };

  const onRowDragEnd = () => { rowDragSrcIdx.value = rowDragOverIdx.value = -1; };

  const reorderedRows: ComputedRef<any[]> = computed(() => {
    const rows = getRows();
    if (internalRowOrder.value.length === 0) return rows;

    const map = new Map(rows.map((r: any) => [r.id, r]));
    const ordered = internalRowOrder.value
      .map(id => map.get(id))
      .filter(Boolean);

    const orderedIds = new Set(internalRowOrder.value);
    const newRows = rows.filter((r: any) => !orderedIds.has(r.id));

    return [...newRows, ...ordered];
  });

  return {
    rowDragSrcIdx, rowDragOverIdx, rowDragOverPos,
    onRowDragStart, onRowDragOver, onRowDrop, onRowDragEnd,
    reorderedRows,
  };
}
