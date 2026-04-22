// packages/vue/src/composables/useColumnDrag.ts
// 컬럼 헤더 드래그 앤 드롭으로 순서 변경 — 내부 상태 자체 관리 방식
import { ref, computed } from 'vue-demi';
import type { Column } from '@anthropic/wz-grid-core';

export function useColumnDrag(
  getColumns: () => Column[],
  onReorder: (srcKey: string, targetKey: string) => void,
  getIsResizing?: () => boolean
) {
  const dragSourceColIdx = ref(-1);
  const dragOverColIdx   = ref(-1);

  const internalOrder = ref<string[]>([]);

  const onDragStart = (colIdx: number, e: DragEvent) => {
    if (getIsResizing?.()) { e.preventDefault(); return; }
    dragSourceColIdx.value = colIdx;
  };
  const onDragOver  = (colIdx: number) => { if (colIdx !== dragSourceColIdx.value) dragOverColIdx.value = colIdx; };
  const onDragLeave = () => { dragOverColIdx.value = -1; };
  const onDragEnd   = () => { dragSourceColIdx.value = -1; dragOverColIdx.value = -1; };

  const onDrop = (targetIdx: number) => {
    const srcIdx = dragSourceColIdx.value;
    if (srcIdx === -1 || srcIdx === targetIdx) { onDragEnd(); return; }

    const currentCols = reorderedColumns.value;
    const srcKey    = currentCols[srcIdx]?.key;
    const targetKey = currentCols[targetIdx]?.key;
    if (!srcKey || !targetKey) { onDragEnd(); return; }

    const keys = currentCols.map(c => c.key);
    const si = keys.indexOf(srcKey);
    const [moved] = keys.splice(si, 1);
    const ti = keys.indexOf(targetKey);
    keys.splice(ti, 0, moved);
    internalOrder.value = keys;

    onReorder(srcKey, targetKey);
    onDragEnd();
  };

  const reorderedColumns = computed<Column[]>(() => {
    const cols = getColumns();
    if (internalOrder.value.length === 0) return cols;

    const map = new Map(cols.map(c => [c.key, c]));
    const ordered = internalOrder.value
      .map(key => map.get(key))
      .filter(Boolean) as Column[];

    const orderedKeys = new Set(internalOrder.value);
    const newCols = cols.filter(c => !orderedKeys.has(c.key));

    return [...ordered, ...newCols];
  });

  return {
    dragSourceColIdx, dragOverColIdx,
    onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
    reorderedColumns,
  };
}
