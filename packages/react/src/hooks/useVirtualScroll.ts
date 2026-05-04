// packages/react/src/hooks/useVirtualScroll.ts
import { useState, useCallback, useMemo } from 'react';
import { computeVisibleRange, computePadding } from '@wezon/wz-grid-core';
import type { VirtualScrollRange, VirtualScrollPadding } from '@wezon/wz-grid-core';

export interface UseVirtualScrollReturn {
  /** 렌더링할 행 범위 [startIdx, endIdx) */
  visibleRange: VirtualScrollRange;
  /** 상단/하단 패딩 (px) */
  padding: VirtualScrollPadding;
  /** 스크롤 이벤트 핸들러 (div의 onScroll에 연결) */
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
}

export function useVirtualScroll(
  totalRows: number,
  options: {
    rowHeight?: number;
    viewportHeight?: number;
    buffer?: number;
    enabled?: boolean;
  } = {}
): UseVirtualScrollReturn {
  const { rowHeight = 36, viewportHeight = 400, buffer = 5, enabled = true } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop((e.currentTarget as HTMLElement).scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    if (!enabled) return { startIdx: 0, endIdx: totalRows };
    return computeVisibleRange(scrollTop, rowHeight, viewportHeight, totalRows, buffer);
  }, [enabled, scrollTop, rowHeight, viewportHeight, totalRows, buffer]);

  const padding = useMemo(
    () => computePadding(visibleRange, totalRows, rowHeight),
    [visibleRange, totalRows, rowHeight]
  );

  return { visibleRange, padding, onScroll };
}
