// packages/core/src/composables/filter.ts
// No Vue dependency — pure TypeScript
import type { Column } from '../types/grid';

/** 컬럼 타입에 따른 초기 필터 값 */
export type FilterValue =
  | { value: string }
  | { values: any[]; value: string }
  | { min: string; max: string }
  | { from: string; to: string };

export type FiltersMap = Record<string, FilterValue>;

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/** 컬럼 타입에 맞는 초기 필터 값 반환 */
export function createInitialFilter(col: Column): FilterValue {
  if (col.type === 'number' || col.type === 'currency' || col.type === 'rating')
    return { min: '', max: '' };
  if (col.type === 'date' || col.type === 'datetime')
    return { from: '', to: '' };
  if (col.type === 'select' || col.type === 'badge')
    return { values: [] as any[], value: '' };
  return { value: '' };
}

/** 특정 필터가 활성화 상태인지 */
export function isFilterActive(f: FilterValue | undefined): boolean {
  if (!f) return false;
  if ('values' in f && (f as any).values.length > 0) return true;
  if ('value' in f && String((f as any).value ?? '') !== '') return true;
  if ('min' in f || 'max' in f) {
    const ff = f as any;
    return String(ff.min ?? '') !== '' || String(ff.max ?? '') !== '';
  }
  if ('from' in f || 'to' in f) {
    const ff = f as any;
    return String(ff.from ?? '') !== '' || String(ff.to ?? '') !== '';
  }
  return false;
}

/** 특정 컬럼 필터를 초기 상태로 리셋한 새 필터 객체 반환 */
export function clearFilter(filters: FiltersMap, key: string): FiltersMap {
  const f = filters[key];
  if (!f) return filters;
  const reset: any = { ...f };
  if ('values' in reset) reset.values = [];
  if ('value' in reset) reset.value = '';
  if ('min' in reset) reset.min = '';
  if ('max' in reset) reset.max = '';
  if ('from' in reset) reset.from = '';
  if ('to' in reset) reset.to = '';
  return { ...filters, [key]: reset };
}

/** 전체 필터 초기화 */
export function clearAllFilters(filters: FiltersMap, columns: Column[]): FiltersMap {
  let result = { ...filters };
  for (const col of columns) {
    result = clearFilter(result, col.key);
  }
  return result;
}

/** 컬럼 목록에 없는 키는 유지하고, 없는 키는 초기값으로 추가한 필터 맵 반환 */
export function initFilters(existing: FiltersMap, columns: Column[]): FiltersMap {
  const result = { ...existing };
  for (const col of columns) {
    if (result[col.key] === undefined) {
      result[col.key] = createInitialFilter(col);
    }
  }
  return result;
}

/** filters + columns를 기준으로 rows를 필터링 */
export function filterRows(
  rows: any[],
  filters: FiltersMap,
  columns: Column[],
  isEnabled: boolean
): any[] {
  if (!isEnabled) return rows;
  return rows.filter(row => {
    for (const col of columns) {
      const f: any = filters[col.key];
      if (!isFilterActive(f)) continue;
      const val = row[col.key];

      if (col.type === 'number' || col.type === 'currency' || col.type === 'rating') {
        const n = Number(val ?? 0);
        if (f.min !== '' && n < Number(f.min)) return false;
        if (f.max !== '' && n > Number(f.max)) return false;
      } else if (col.type === 'tag') {
        const query = String(f.value ?? '').toLowerCase();
        if (query) {
          const tags: string[] = Array.isArray(val) ? val : [];
          if (!tags.some(t => String(t).toLowerCase().includes(query))) return false;
        }
      } else if (col.type === 'date') {
        const s = String(val ?? '');
        if (f.from && s < f.from) return false;
        if (f.to && s > f.to) return false;
      } else if (col.type === 'datetime') {
        const s = String(val ?? '').substring(0, 16);
        if (f.from && s < f.from) return false;
        if (f.to && s > f.to) return false;
      } else if (col.type === 'boolean') {
        if (f.value === 'true' && !val) return false;
        if (f.value === 'false' && val) return false;
      } else if ('values' in f && Array.isArray(f.values) && f.values.length > 0) {
        if (!f.values.includes(val)) return false;
      } else {
        const text = String(val ?? '').toLowerCase();
        const query = String(f.value ?? '').toLowerCase();
        if (query && !text.includes(query)) return false;
      }
    }
    return true;
  });
}

/** 활성 필터 수 계산 */
export function countActiveFilters(filters: FiltersMap, columns: Column[]): number {
  return columns.filter(col => isFilterActive(filters[col.key])).length;
}

// ─── 상태 팩토리 ─────────────────────────────────────────────────────────────

export interface FilterEngine {
  getFilters: () => FiltersMap;
  setFilter: (key: string, value: FilterValue) => void;
  isFilterActive: (key: string) => boolean;
  countActiveFilters: (columns: Column[]) => number;
  clearFilter: (key: string) => void;
  clearAllFilters: (columns: Column[]) => void;
  initFilters: (columns: Column[]) => void;
  filterRows: (rows: any[], columns: Column[], isEnabled: boolean) => any[];
}

export function createFilterEngine(): FilterEngine {
  let filters: FiltersMap = {};

  return {
    getFilters: () => filters,
    setFilter: (key, value) => { filters = { ...filters, [key]: value }; },
    isFilterActive: (key) => isFilterActive(filters[key]),
    countActiveFilters: (columns) => countActiveFilters(filters, columns),
    clearFilter: (key) => { filters = clearFilter(filters, key); },
    clearAllFilters: (columns) => { filters = clearAllFilters(filters, columns); },
    initFilters: (columns) => { filters = initFilters(filters, columns); },
    filterRows: (rows, columns, isEnabled) => filterRows(rows, filters, columns, isEnabled),
  };
}
