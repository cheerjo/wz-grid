// packages/core/src/composables/performance.ts
// No Vue dependency — pure TypeScript

/** 성능 측정 결과 항목 */
export interface PerfEntry {
  type: 'render' | 'sort' | 'filter';
  duration: number;
  count: number;
  timestamp: number;
}

export interface PerformanceEngine {
  markStart: (type: PerfEntry['type']) => void;
  markEnd: (type: PerfEntry['type'], count: number) => void;
}

const perfNow = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

export function createPerformanceEngine(
  getEnabled: () => boolean,
  onPerf: (entry: PerfEntry) => void,
  getDebug: () => boolean
): PerformanceEngine {
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
