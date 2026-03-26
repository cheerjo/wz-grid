// src/composables/useColumnDrag.ts
// 컬럼 헤더 드래그 앤 드롭으로 순서 변경 — 내부 상태 자체 관리 방식
import { ref, computed } from 'vue-demi';
import { Column } from '../types/grid';

export function useColumnDrag(
  getColumns: () => Column[],
  onReorder: (srcKey: string, targetKey: string) => void,
  getIsResizing?: () => boolean
) {
  const dragSourceColIdx = ref(-1);
  const dragOverColIdx   = ref(-1);

  // 내부적으로 관리하는 컬럼 순서 (key 배열)
  // 비어있으면 원본 순서 유지, 값이 있으면 이 순서를 따름
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

    // reorderedColumns 기준으로 키를 가져와야 현재 표시 순서와 일치
    const currentCols = reorderedColumns.value;
    const srcKey    = currentCols[srcIdx]?.key;
    const targetKey = currentCols[targetIdx]?.key;
    if (!srcKey || !targetKey) { onDragEnd(); return; }

    // 내부 순서 업데이트: 현재 순서에서 src를 빼고 target 위치에 삽입
    const keys = currentCols.map(c => c.key);
    const si = keys.indexOf(srcKey);
    const [moved] = keys.splice(si, 1);
    const ti = keys.indexOf(targetKey);
    keys.splice(ti, 0, moved);
    internalOrder.value = keys;

    // 외부 이벤트도 emit (하위 호환)
    onReorder(srcKey, targetKey);
    onDragEnd();
  };

  // 내부 순서가 적용된 컬럼 목록
  // props.columns가 변경되면 새 컬럼도 자동 반영됨
  const reorderedColumns = computed<Column[]>(() => {
    const cols = getColumns();
    if (internalOrder.value.length === 0) return cols;

    const map = new Map(cols.map(c => [c.key, c]));
    // internalOrder에 있는 키 → 순서대로 매핑
    const ordered = internalOrder.value
      .map(key => map.get(key))
      .filter(Boolean) as Column[];

    // 새로 추가된 컬럼(internalOrder에 없는)은 뒤에 붙임
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
