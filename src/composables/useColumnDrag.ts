// src/composables/useColumnDrag.ts
import { ref } from 'vue-demi';
import { Column } from '../types/grid';

export function useColumnDrag(
  getVisibleColumns: () => Column[],
  onReorder: (srcKey: string, targetKey: string) => void
) {
  const dragSourceColIdx = ref(-1);
  const dragOverColIdx   = ref(-1);

  const onDragStart = (colIdx: number) => { dragSourceColIdx.value = colIdx; };
  const onDragOver  = (colIdx: number) => { if (colIdx !== dragSourceColIdx.value) dragOverColIdx.value = colIdx; };
  const onDragLeave = () => { dragOverColIdx.value = -1; };
  const onDragEnd   = () => { dragSourceColIdx.value = -1; dragOverColIdx.value = -1; };

  const onDrop = (targetIdx: number) => {
    const srcIdx = dragSourceColIdx.value;
    if (srcIdx === -1 || srcIdx === targetIdx) { onDragEnd(); return; }
    const srcKey    = getVisibleColumns()[srcIdx]?.key;
    const targetKey = getVisibleColumns()[targetIdx]?.key;
    if (!srcKey || !targetKey) { onDragEnd(); return; }
    onReorder(srcKey, targetKey);
    onDragEnd();
  };

  return { dragSourceColIdx, dragOverColIdx, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd };
}
