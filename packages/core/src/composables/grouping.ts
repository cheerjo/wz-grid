// packages/core/src/composables/grouping.ts
// No Vue dependency — pure TypeScript
import type { Column, GridItem } from '../types/grid';

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/** 그룹 레이블 문자열 반환 */
export function getGroupLabel(key: string, groupCol: Column | undefined): string {
  if (groupCol?.options) {
    return groupCol.options.find(o => String(o.value) === key)?.label ?? key;
  }
  if (groupCol?.type === 'boolean') {
    return key === 'true' ? '예' : key === 'false' ? '아니요' : key;
  }
  return key || '(없음)';
}

/**
 * 필터링된 rows를 그룹핑하여 GridItem[] 반환.
 * groupBy가 빈 문자열이면 그룹 없이 data 아이템만 반환.
 */
export function buildGroupedItems(
  filteredRows: any[],
  groupBy: string,
  columns: Column[],
  visibleColumns: Column[],
  collapsedGroups: Set<string>
): GridItem[] {
  if (!groupBy) return filteredRows.map(row => ({ type: 'data' as const, row }));

  const groupMap = new Map<string, any[]>();
  for (const row of filteredRows) {
    const key = String(row[groupBy] ?? '');
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(row);
  }

  const groupCol = columns.find(c => c.key === groupBy);
  const numberCols = visibleColumns.filter(c => c.type === 'number');

  const result: GridItem[] = [];
  for (const [key, rows] of groupMap) {
    const collapsed = collapsedGroups.has(key);
    result.push({
      type: 'group-header' as const,
      key,
      label: getGroupLabel(key, groupCol),
      count: rows.length,
      collapsed,
    });
    if (!collapsed) {
      rows.forEach(row => result.push({ type: 'data' as const, row }));
      if (numberCols.length > 0) {
        const sums: Record<string, number> = {};
        numberCols.forEach(col => {
          sums[col.key] = rows.reduce((acc: number, r: any) => acc + Number(r[col.key] || 0), 0);
        });
        result.push({ type: 'subtotal' as const, key, count: rows.length, sums });
      }
    }
  }
  return result;
}

// ─── 상태 팩토리 ─────────────────────────────────────────────────────────────

export interface GroupingEngine {
  getCollapsedGroups: () => Set<string>;
  toggleGroup: (groupKey: string) => Set<string>;
  buildGroupedItems: (
    filteredRows: any[],
    groupBy: string,
    columns: Column[],
    visibleColumns: Column[]
  ) => GridItem[];
}

export function createGroupingEngine(): GroupingEngine {
  let collapsedGroups: Set<string> = new Set();

  const getCollapsedGroups = () => collapsedGroups;

  const toggleGroup = (groupKey: string): Set<string> => {
    const next = new Set(collapsedGroups);
    next.has(groupKey) ? next.delete(groupKey) : next.add(groupKey);
    collapsedGroups = next;
    return collapsedGroups;
  };

  const build = (
    filteredRows: any[],
    groupBy: string,
    columns: Column[],
    visibleColumns: Column[]
  ): GridItem[] => buildGroupedItems(filteredRows, groupBy, columns, visibleColumns, collapsedGroups);

  return { getCollapsedGroups, toggleGroup, buildGroupedItems: build };
}
