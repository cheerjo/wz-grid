// packages/react/src/hooks/useFilter.ts
import { useState, useMemo, useCallback } from 'react';
import {
  filterRows,
  createInitialFilter,
  isFilterActive,
  clearFilter as clearFilterPure,
  clearAllFilters as clearAllFiltersPure,
  countActiveFilters,
} from '@wezon/wz-grid-core';
import type { Column, FiltersMap, FilterValue } from '@wezon/wz-grid-core';

export interface UseFilterReturn {
  /** 컬럼별 필터 값 맵 */
  filters: FiltersMap;
  /** 특정 컬럼의 필터가 활성화되었는지 */
  isFilterActive: (key: string) => boolean;
  /** 현재 활성화된 필터 수 */
  activeFilterCount: number;
  /** 필터 값 변경 */
  setFilter: (key: string, value: FilterValue) => void;
  /** 특정 컬럼 필터 초기화 */
  clearFilter: (key: string) => void;
  /** 전체 필터 초기화 */
  clearAllFilters: () => void;
  /** 필터가 적용된 rows */
  filteredRows: any[];
}

export function useFilter(
  rows: any[],
  columns: Column[],
  isEnabled = true
): UseFilterReturn {
  // columns가 변경될 때 초기 필터 맵 생성
  const [filters, setFilters] = useState<FiltersMap>(() => {
    const init: FiltersMap = {};
    for (const col of columns) {
      init[col.key] = createInitialFilter(col);
    }
    return init;
  });

  // 새 컬럼이 추가될 때 필터 맵에 초기값 추가
  const ensureFilters = useCallback(
    (cols: Column[], current: FiltersMap): FiltersMap => {
      let updated = false;
      const next = { ...current };
      for (const col of cols) {
        if (next[col.key] === undefined) {
          next[col.key] = createInitialFilter(col);
          updated = true;
        }
      }
      return updated ? next : current;
    },
    []
  );

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => clearFilterPure(prev, key));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(prev => clearAllFiltersPure(prev, columns));
  }, [columns]);

  const checkIsActive = useCallback(
    (key: string) => isFilterActive(filters[key]),
    [filters]
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, columns),
    [filters, columns]
  );

  const filteredRows = useMemo(() => {
    const updated = ensureFilters(columns, filters);
    return filterRows(rows, updated, columns, isEnabled);
  }, [rows, filters, columns, isEnabled, ensureFilters]);

  return {
    filters,
    isFilterActive: checkIsActive,
    activeFilterCount,
    setFilter,
    clearFilter,
    clearAllFilters,
    filteredRows,
  };
}
