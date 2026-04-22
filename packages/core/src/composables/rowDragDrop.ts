// packages/core/src/composables/rowDragDrop.ts
// No Vue dependency — pure TypeScript

export interface RowDragState {
  dragSrcIdx: number;
  dragOverIdx: number;
  dragOverPos: 'above' | 'below';
  /** 내부적으로 관리하는 행 순서 (id 배열). 비어있으면 원본 순서 사용. */
  internalRowOrder: any[];
}

export interface RowDragDropEngine {
  getState: () => RowDragState;
  onRowDragStart: (itemIdx: number) => void;
  /**
   * 드래그 오버 처리. clientY와 elementRect를 받아 'above'/'below' 결정.
   * returns true이면 preventDefault가 필요함.
   */
  onRowDragOver: (itemIdx: number, clientY: number, elementRect: { top: number; height: number }) => boolean;
  onRowDrop: (
    itemIdx: number,
    getRow: (idx: number) => any,
    rows: any[],
    onReorder: (from: any, to: any, position: 'above' | 'below') => void
  ) => void;
  onRowDragEnd: () => void;
  /** 내부 순서가 적용된 행 목록 반환 */
  reorderRows: (rows: any[]) => any[];
}

export function createRowDragDropEngine(): RowDragDropEngine {
  let state: RowDragState = {
    dragSrcIdx: -1,
    dragOverIdx: -1,
    dragOverPos: 'below',
    internalRowOrder: [],
  };

  const getState = () => ({ ...state, internalRowOrder: [...state.internalRowOrder] });

  const onRowDragStart = (itemIdx: number) => {
    state = { ...state, dragSrcIdx: itemIdx };
  };

  const onRowDragOver = (
    itemIdx: number,
    clientY: number,
    elementRect: { top: number; height: number }
  ): boolean => {
    if (itemIdx === state.dragSrcIdx) return false;
    const pos: 'above' | 'below' = clientY < elementRect.top + elementRect.height / 2 ? 'above' : 'below';
    state = { ...state, dragOverPos: pos, dragOverIdx: itemIdx };
    return true;
  };

  const reorderRows = (rows: any[]): any[] => {
    if (state.internalRowOrder.length === 0) return rows;
    const map = new Map(rows.map((r: any) => [r.id, r]));
    const ordered = state.internalRowOrder.map(id => map.get(id)).filter(Boolean);
    const orderedIds = new Set(state.internalRowOrder);
    const newRows = rows.filter((r: any) => !orderedIds.has(r.id));
    return [...newRows, ...ordered];
  };

  const onRowDrop = (
    itemIdx: number,
    getRow: (idx: number) => any,
    rows: any[],
    onReorder: (from: any, to: any, position: 'above' | 'below') => void
  ) => {
    const from = getRow(state.dragSrcIdx);
    const to   = getRow(itemIdx);
    if (from && to && from.id !== to.id) {
      const currentRows = reorderRows(rows);
      const ids = currentRows.map((r: any) => r.id);
      const fromIdx = ids.indexOf(from.id);
      if (fromIdx !== -1) {
        const [movedId] = ids.splice(fromIdx, 1);
        const toIdx = ids.indexOf(to.id);
        if (toIdx !== -1) {
          ids.splice(state.dragOverPos === 'above' ? toIdx : toIdx + 1, 0, movedId);
          state = { ...state, internalRowOrder: ids };
        }
      }
      onReorder(from, to, state.dragOverPos);
    }
    state = { ...state, dragSrcIdx: -1, dragOverIdx: -1 };
  };

  const onRowDragEnd = () => {
    state = { ...state, dragSrcIdx: -1, dragOverIdx: -1 };
  };

  return { getState, onRowDragStart, onRowDragOver, onRowDrop, onRowDragEnd, reorderRows };
}
