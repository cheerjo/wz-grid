// src/composables/useSort.ts
import { ref, computed } from 'vue-demi';
import type { Ref, ComputedRef } from 'vue-demi';
import type { SortConfig, GridRow, Column } from '../types/grid';

export interface UseSortReturn {
  /** 현재 활성화된 정렬 기준 목록 (다중 정렬 지원) */
  sortConfigs: Ref<SortConfig[]>;
  /** 특정 key의 정렬 항목 반환. 없으면 undefined. */
  getSortEntry: (key: string) => SortConfig | undefined;
  /** 특정 key의 정렬 인덱스 반환. 없으면 -1. */
  getSortIndex: (key: string) => number;
  /** 헤더 클릭 시 정렬 토글. Shift+클릭으로 다중 정렬. */
  toggleSort: (key: string, e: MouseEvent) => void;
  /** 정렬 기준이 적용된 rows. serverSide=true이면 원본 반환. */
  sortedRows: ComputedRef<GridRow[]>;
}

export function useSort(
  onSort: (configs: SortConfig[]) => void,
  getRows: () => GridRow[],
  isServerSide: () => boolean,
  getColumns?: () => Column[]
): UseSortReturn {
  const sortConfigs = ref<SortConfig[]>([]);

  const getSortEntry = (key: string) => sortConfigs.value.find(s => s.key === key);
  const getSortIndex = (key: string) => sortConfigs.value.findIndex(s => s.key === key);

  const toggleSort = (key: string, e: MouseEvent) => {
    const existing = sortConfigs.value.find(s => s.key === key);
    if (e.shiftKey) {
      if (!existing) {
        sortConfigs.value = [...sortConfigs.value, { key, order: 'asc' }];
      } else if (existing.order === 'asc') {
        sortConfigs.value = sortConfigs.value.map(s => s.key === key ? { ...s, order: 'desc' as const } : s);
      } else {
        sortConfigs.value = sortConfigs.value.filter(s => s.key !== key);
      }
    } else {
      if (existing && sortConfigs.value.length === 1) {
        sortConfigs.value = [{ key, order: existing.order === 'asc' ? 'desc' : 'asc' }];
      } else {
        sortConfigs.value = [{ key, order: 'asc' }];
      }
    }
    onSort(sortConfigs.value);
  };

  // 값 비교: 숫자/날짜(ISO 문자열)/문자열 자동 감지
  const compareValues = (a: any, b: any): number => {
    if (a === null || a === undefined || a === '') return 1;
    if (b === null || b === undefined || b === '') return -1;

    // 숫자 (빈 문자열 제외 후 변환)
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;

    // 날짜 (ISO 형식: YYYY-MM-DD 또는 YYYY-MM-DDTHH:mm:ss)
    const da = Date.parse(String(a));
    const db = Date.parse(String(b));
    if (!isNaN(da) && !isNaN(db)) return da - db;

    // 문자열
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
  };

  // 컬럼 타입 인식 비교: tag는 배열 길이, currency는 숫자 기준
  const compareByColumn = (a: any, b: any, col: Column): number => {
    if (col.type === 'tag') {
      const lenA = Array.isArray(a) ? a.length : 0;
      const lenB = Array.isArray(b) ? b.length : 0;
      return lenA - lenB;
    }
    // currency는 숫자 비교 (compareValues에서 숫자 감지로 처리)
    return compareValues(a, b);
  };

  const sortedRows = computed((): GridRow[] => {
    const rows = getRows();
    // 서버사이드 모드이거나 정렬 기준이 없으면 원본 반환
    if (isServerSide() || sortConfigs.value.length === 0) return rows;

    const columns = getColumns ? getColumns() : [];
    const colMap = new Map<string, Column>(columns.map(c => [c.key, c]));

    return [...rows].sort((a, b) => {
      for (const { key, order } of sortConfigs.value) {
        const col = colMap.get(key);
        const cmp = col ? compareByColumn(a[key], b[key], col) : compareValues(a[key], b[key]);
        if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  return { sortConfigs, getSortEntry, getSortIndex, toggleSort, sortedRows };
}
