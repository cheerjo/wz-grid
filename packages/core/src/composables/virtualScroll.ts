// packages/core/src/composables/virtualScroll.ts
// No Vue dependency — pure TypeScript

export interface VirtualScrollRange {
  startIdx: number;
  endIdx: number;
}

export interface VirtualScrollPadding {
  top: number;
  bottom: number;
}

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/**
 * 스크롤 위치와 뷰포트 크기를 기반으로 렌더링할 행 범위를 계산.
 * buffer: 뷰포트 위아래로 추가 렌더링할 행 수 (기본 5)
 */
export function computeVisibleRange(
  scrollTop: number,
  rowHeight: number,
  viewportHeight: number,
  totalRows: number,
  buffer: number = 5
): VirtualScrollRange {
  const startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIdx = Math.min(
    totalRows,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + buffer
  );
  return { startIdx, endIdx };
}

/** visibleRange와 rowHeight로 padding 계산 */
export function computePadding(
  range: VirtualScrollRange,
  totalRows: number,
  rowHeight: number
): VirtualScrollPadding {
  return {
    top: range.startIdx * rowHeight,
    bottom: (totalRows - range.endIdx) * rowHeight,
  };
}

// ─── 상태 팩토리 ─────────────────────────────────────────────────────────────

export interface VirtualScrollEngine {
  getScrollTop: () => number;
  setScrollTop: (value: number) => void;
  getVisibleRange: (totalRows: number, rowHeight: number, viewportHeight: number) => VirtualScrollRange;
  getPadding: (totalRows: number, rowHeight: number, viewportHeight: number) => VirtualScrollPadding;
}

export function createVirtualScrollEngine(buffer: number = 5): VirtualScrollEngine {
  let scrollTop = 0;

  const getScrollTop = () => scrollTop;
  const setScrollTop = (value: number) => { scrollTop = value; };

  const getVisibleRange = (totalRows: number, rowHeight: number, viewportHeight: number): VirtualScrollRange =>
    computeVisibleRange(scrollTop, rowHeight, viewportHeight, totalRows, buffer);

  const getPadding = (totalRows: number, rowHeight: number, viewportHeight: number): VirtualScrollPadding => {
    const range = computeVisibleRange(scrollTop, rowHeight, viewportHeight, totalRows, buffer);
    return computePadding(range, totalRows, rowHeight);
  };

  return { getScrollTop, setScrollTop, getVisibleRange, getPadding };
}
