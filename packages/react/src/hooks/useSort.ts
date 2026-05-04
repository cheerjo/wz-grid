// packages/react/src/hooks/useSort.ts
import { useState, useMemo } from 'react';
import { sortRows, computeToggleSort } from '@wezon/wz-grid-core';
import type { SortConfig, GridRow, Column } from '@wezon/wz-grid-core';

export interface UseSortReturn {
  /** 현재 활성화된 정렬 기준 목록 */
  sortConfigs: SortConfig[];
  /** 특정 key의 정렬 항목 반환. 없으면 undefined. */
  getSortEntry: (key: string) => SortConfig | undefined;
  /** 특정 key의 정렬 인덱스 반환. 없으면 -1. */
  getSortIndex: (key: string) => number;
  /** 헤더 클릭 시 정렬 토글. Shift+클릭으로 다중 정렬. */
  toggleSort: (key: string, shiftKey?: boolean) => void;
  /** 정렬 기준이 적용된 rows */
  sortedRows: GridRow[];
}

export function useSort(
  rows: GridRow[],
  options: {
    isServerSide?: boolean;
    columns?: Column[];
    onSort?: (configs: SortConfig[]) => void;
  } = {}
): UseSortReturn {
  const { isServerSide = false, columns = [], onSort } = options;
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  const getSortEntry = (key: string) => sortConfigs.find(s => s.key === key);
  const getSortIndex = (key: string) => sortConfigs.findIndex(s => s.key === key);

  const toggleSort = (key: string, shiftKey = false) => {
    const next = computeToggleSort(sortConfigs, key, shiftKey);
    setSortConfigs(next);
    onSort?.(next);
  };

  const sortedRows = useMemo(
    () => sortRows(rows, sortConfigs, isServerSide, columns),
    [rows, sortConfigs, isServerSide, columns]
  );

  return { sortConfigs, getSortEntry, getSortIndex, toggleSort, sortedRows };
}
