// src/composables/useRowDragDrop.ts
import { ref } from 'vue-demi';

export function useRowDragDrop(
  getRow: (idx: number) => any,
  onReorder: (from: any, to: any, position: 'above' | 'below') => void
) {
  const rowDragSrcIdx  = ref(-1);
  const rowDragOverIdx = ref(-1);
  const rowDragOverPos = ref<'above' | 'below'>('below');

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
    if (from && to && from.id !== to.id) onReorder(from, to, rowDragOverPos.value);
    rowDragSrcIdx.value = rowDragOverIdx.value = -1;
  };

  const onRowDragEnd = () => { rowDragSrcIdx.value = rowDragOverIdx.value = -1; };

  return { rowDragSrcIdx, rowDragOverIdx, rowDragOverPos, onRowDragStart, onRowDragOver, onRowDrop, onRowDragEnd };
}
