// packages/core/src/composables/sort.ts
// No Vue dependency — pure TypeScript
import type { SortConfig, GridRow, Column } from '../types/grid';

export interface SortState {
  configs: SortConfig[];
}

export interface SortEngine {
  getState: () => SortState;
  getSortEntry: (key: string) => SortConfig | undefined;
  getSortIndex: (key: string) => number;
  /** 헤더 클릭 시 정렬 토글. shiftKey=true이면 다중 정렬. */
  toggleSort: (key: string, shiftKey: boolean) => SortConfig[];
  /** 정렬 기준이 적용된 rows 반환. serverSide=true이면 원본 반환. */
  sortRows: (rows: GridRow[], isServerSide: boolean, columns?: Column[]) => GridRow[];
}

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/** 두 값 비교: 숫자/날짜(ISO)/문자열 자동 감지 */
export function compareValues(a: any, b: any): number {
  if (a === null || a === undefined || a === '') return 1;
  if (b === null || b === undefined || b === '') return -1;

  const na = Number(a);
  const nb = Number(b);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;

  const da = Date.parse(String(a));
  const db = Date.parse(String(b));
  if (!isNaN(da) && !isNaN(db)) return da - db;

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** 컬럼 타입 인식 비교: tag는 배열 길이 기준 */
export function compareByColumn(a: any, b: any, col: Column): number {
  if (col.type === 'tag') {
    const lenA = Array.isArray(a) ? a.length : 0;
    const lenB = Array.isArray(b) ? b.length : 0;
    return lenA - lenB;
  }
  return compareValues(a, b);
}

/** configs 배열에 따라 rows를 정렬한 새 배열 반환 */
export function sortRows(
  rows: GridRow[],
  configs: SortConfig[],
  isServerSide: boolean,
  columns: Column[] = []
): GridRow[] {
  if (isServerSide || configs.length === 0) return rows;

  const colMap = new Map<string, Column>(columns.map(c => [c.key, c]));
  return [...rows].sort((a, b) => {
    for (const { key, order } of configs) {
      const col = colMap.get(key);
      const cmp = col ? compareByColumn(a[key], b[key], col) : compareValues(a[key], b[key]);
      if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}

/** toggleSort 순수 함수 — 기존 configs에서 새 configs를 계산해 반환 */
export function computeToggleSort(configs: SortConfig[], key: string, shiftKey: boolean): SortConfig[] {
  const existing = configs.find(s => s.key === key);
  if (shiftKey) {
    if (!existing) return [...configs, { key, order: 'asc' }];
    if (existing.order === 'asc') return configs.map(s => s.key === key ? { ...s, order: 'desc' as const } : s);
    return configs.filter(s => s.key !== key);
  } else {
    if (existing && configs.length === 1) {
      return [{ key, order: existing.order === 'asc' ? 'desc' : 'asc' }];
    }
    return [{ key, order: 'asc' }];
  }
}

// ─── 상태 팩토리 ─────────────────────────────────────────────────────────────

export function createSortEngine(
  onSort: (configs: SortConfig[]) => void,
): SortEngine {
  let configs: SortConfig[] = [];

  const getState = (): SortState => ({ configs });
  const getSortEntry = (key: string) => configs.find(s => s.key === key);
  const getSortIndex = (key: string) => configs.findIndex(s => s.key === key);

  const toggleSort = (key: string, shiftKey: boolean): SortConfig[] => {
    configs = computeToggleSort(configs, key, shiftKey);
    onSort(configs);
    return configs;
  };

  const sort = (rows: GridRow[], isServerSide: boolean, columns?: Column[]): GridRow[] =>
    sortRows(rows, configs, isServerSide, columns);

  return { getState, getSortEntry, getSortIndex, toggleSort, sortRows: sort };
}
