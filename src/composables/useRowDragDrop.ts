// src/composables/useRowDragDrop.ts
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

  // 내부적으로 관리하는 행 순서 (id 배열)
  // 비어있으면 원본 순서 유지, 값이 있으면 이 순서를 따름
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
      // 내부 순서 업데이트: 현재 표시 순서에서 from을 빼고 to 위치에 삽입
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
      // 외부 이벤트도 emit (하위 호환)
      onReorder(from, to, rowDragOverPos.value);
    }
    rowDragSrcIdx.value = rowDragOverIdx.value = -1;
  };

  const onRowDragEnd = () => { rowDragSrcIdx.value = rowDragOverIdx.value = -1; };

  // 내부 순서가 적용된 행 목록
  // props.rows가 변경되면(추가/삭제 등) 새 행도 자동 반영
  const reorderedRows: ComputedRef<any[]> = computed(() => {
    const rows = getRows();
    if (internalRowOrder.value.length === 0) return rows;

    const map = new Map(rows.map((r: any) => [r.id, r]));
    // internalRowOrder에 있는 id → 순서대로 매핑
    const ordered = internalRowOrder.value
      .map(id => map.get(id))
      .filter(Boolean);

    // 새로 추가된 행(internalRowOrder에 없는)은 앞에 붙임
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
