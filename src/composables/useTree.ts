// src/composables/useTree.ts
import { ref, computed } from 'vue-demi';
import type { DataItem } from '../types/grid';

export function useTree(
  getRows: () => any[],
  getEnabled: () => boolean,
  getChildrenKey: () => string,
  getFilteredIds: () => Set<any> | null
) {
  const collapsedIds = ref<Set<any>>(new Set());

  // 필터 적용 시: 일치 노드 + 그 조상 노드만 visible로 표시
  function buildVisibleIds(rows: any[], filteredIds: Set<any>): Set<any> {
    const visible = new Set<any>();
    function mark(rows: any[]): boolean {
      let anyVisible = false;
      for (const row of rows) {
        const children = row[getChildrenKey()];
        const childVisible = Array.isArray(children) && children.length > 0 ? mark(children) : false;
        if (filteredIds.has(row.id) || childVisible) {
          visible.add(row.id);
          anyVisible = true;
        }
      }
      return anyVisible;
    }
    mark(rows);
    return visible;
  }

  const flatTreeItems = computed((): DataItem[] => {
    if (!getEnabled()) return [];
    const filteredIds = getFilteredIds();
    const visibleIds = filteredIds ? buildVisibleIds(getRows(), filteredIds) : null;
    const result: DataItem[] = [];

    function flatten(rows: any[], level: number) {
      for (const row of rows) {
        if (visibleIds && !visibleIds.has(row.id)) continue;
        const children = row[getChildrenKey()];
        const allChildren = Array.isArray(children) ? children : [];
        const hasVisibleChildren = visibleIds
          ? allChildren.some((c: any) => visibleIds.has(c.id))
          : allChildren.length > 0;
        result.push({ type: 'data' as const, row, level, hasChildren: hasVisibleChildren });
        if (hasVisibleChildren && !collapsedIds.value.has(row.id)) {
          flatten(allChildren, level + 1);
        }
      }
    }
    flatten(getRows(), 0);
    return result;
  });

  const toggleNode = (id: any) => {
    const next = new Set(collapsedIds.value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    collapsedIds.value = next;
  };

  const isExpanded = (id: any) => !collapsedIds.value.has(id);

  function collectParentIds(rows: any[], acc: Set<any> = new Set()): Set<any> {
    for (const row of rows) {
      const children = row[getChildrenKey()];
      if (Array.isArray(children) && children.length > 0) {
        acc.add(row.id);
        collectParentIds(children, acc);
      }
    }
    return acc;
  }

  const expandAll  = () => { collapsedIds.value = new Set(); };
  const collapseAll = () => { collapsedIds.value = collectParentIds(getRows()); };

  return { flatTreeItems, toggleNode, isExpanded, expandAll, collapseAll };
}
