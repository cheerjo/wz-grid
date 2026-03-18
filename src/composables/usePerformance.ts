// src/composables/usePerformance.ts

/** 성능 측정 결과 항목 */
export interface PerfEntry {
  /** 측정 대상 */
  type: 'render' | 'sort' | 'filter';
  /** 소요 시간 (밀리초) */
  duration: number;
  /** 처리된 아이템 수 */
  count: number;
  /** 측정 완료 시각 (Unix timestamp) */
  timestamp: number;
}

export interface UsePerformanceReturn {
  markStart: (type: PerfEntry['type']) => void;
  markEnd: (type: PerfEntry['type'], count: number) => void;
}

const perfNow = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

/**
 * WZGrid 성능 측정 composable.
 * `performance` prop이 true일 때만 측정하며, debug 모드에서는 console.table로 출력합니다.
 *
 * @example
 * // WZGrid.vue에서 사용
 * const { markStart, markEnd } = usePerformance(
 *   () => props.performance,
 *   (entry) => emit('perf', entry),
 *   () => props.debug
 * );
 * watch(sortConfigs, () => markStart('sort'), { flush: 'sync' });
 * watch(sortedRows, (rows) => markEnd('sort', rows.length));
 */
export function usePerformance(
  getEnabled: () => boolean,
  onPerf: (entry: PerfEntry) => void,
  getDebug: () => boolean
): UsePerformanceReturn {
  const starts = new Map<string, number>();

  const markStart = (type: PerfEntry['type']): void => {
    if (!getEnabled()) return;
    starts.set(type, perfNow());
  };

  const markEnd = (type: PerfEntry['type'], count: number): void => {
    if (!getEnabled()) return;
    const start = starts.get(type);
    if (start === undefined) return;
    starts.delete(type);
    const entry: PerfEntry = {
      type,
      duration: perfNow() - start,
      count,
      timestamp: Date.now(),
    };
    onPerf(entry);
    if (getDebug()) {
      console.table([{ type, 'ms': entry.duration.toFixed(3), count }]);
    }
  };

  return { markStart, markEnd };
}
