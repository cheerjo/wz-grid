// packages/vue/src/composables/useGrouping.ts
import { ref, computed } from 'vue-demi';
import type { Column, GridItem } from '@anthropic/wz-grid-core';

export function useGrouping(
  getFilteredRows: () => any[],
  getGroupBy: () => string,
  getVisibleColumns: () => Column[],
  getColumns: () => Column[]
) {
  const collapsedGroups = ref<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    const next = new Set(collapsedGroups.value);
    next.has(groupKey) ? next.delete(groupKey) : next.add(groupKey);
    collapsedGroups.value = next;
  };

  const flatGroupedItems = computed((): GridItem[] => {
    if (!getGroupBy()) return getFilteredRows().map(row => ({ type: 'data' as const, row }));

    const groupMap = new Map<string, any[]>();
    for (const row of getFilteredRows()) {
      const key = String(row[getGroupBy()] ?? '');
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(row);
    }

    const groupCol = getColumns().find(c => c.key === getGroupBy());
    const getLabel = (key: string) => {
      if (groupCol?.options) return groupCol.options.find(o => String(o.value) === key)?.label ?? key;
      if (groupCol?.type === 'boolean') return key === 'true' ? '예' : key === 'false' ? '아니요' : key;
      return key || '(없음)';
    };

    const numberCols = getVisibleColumns().filter(c => c.type === 'number');
    const result: GridItem[] = [];
    for (const [key, rows] of groupMap) {
      const collapsed = collapsedGroups.value.has(key);
      result.push({ type: 'group-header' as const, key, label: getLabel(key), count: rows.length, collapsed });
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
  });

  const groupColTitle = computed(() => getColumns().find(c => c.key === getGroupBy())?.title || getGroupBy());

  return { collapsedGroups, toggleGroup, flatGroupedItems, groupColTitle };
}
