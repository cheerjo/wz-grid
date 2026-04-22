// packages/core/src/composables/tree.ts
// No Vue dependency — pure TypeScript
import type { DataItem } from '../types/grid';

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/**
 * 필터 적용 시: 일치 노드 + 그 조상 노드만 포함하는 visibleIds Set을 계산.
 * filteredIds가 null이면 null 반환 (필터 없음 = 전체 표시).
 */
export function buildVisibleIds(
  rows: any[],
  filteredIds: Set<any>,
  childrenKey: string
): Set<any> {
  const visible = new Set<any>();
  function mark(rows: any[]): boolean {
    let anyVisible = false;
    for (const row of rows) {
      const children = row[childrenKey];
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

/**
 * 트리를 평탄화. collapsedIds에 있는 노드의 자식은 포함하지 않음.
 * visibleIds가 null이면 전체, Set이면 해당 id만 표시.
 */
export function flattenTree(
  rows: any[],
  collapsedIds: Set<any>,
  childrenKey: string,
  visibleIds: Set<any> | null
): DataItem[] {
  const result: DataItem[] = [];

  function flatten(rows: any[], level: number) {
    for (const row of rows) {
      if (visibleIds && !visibleIds.has(row.id)) continue;
      const children = row[childrenKey];
      const allChildren = Array.isArray(children) ? children : [];
      const hasVisibleChildren = visibleIds
        ? allChildren.some((c: any) => visibleIds.has(c.id))
        : allChildren.length > 0;
      result.push({ type: 'data' as const, row, level, hasChildren: hasVisibleChildren });
      if (hasVisibleChildren && !collapsedIds.has(row.id)) {
        flatten(allChildren, level + 1);
      }
    }
  }
  flatten(rows, 0);
  return result;
}

/** 모든 부모 노드의 id를 수집 (collapseAll에 사용) */
export function collectParentIds(rows: any[], childrenKey: string, acc: Set<any> = new Set()): Set<any> {
  for (const row of rows) {
    const children = row[childrenKey];
    if (Array.isArray(children) && children.length > 0) {
      acc.add(row.id);
      collectParentIds(children, childrenKey, acc);
    }
  }
  return acc;
}

// ─── 상태 팩토리 ─────────────────────────────────────────────────────────────

export interface TreeEngine {
  getCollapsedIds: () => Set<any>;
  isExpanded: (id: any) => boolean;
  toggleNode: (id: any) => Set<any>;
  expandAll: () => Set<any>;
  collapseAll: (rows: any[], childrenKey: string) => Set<any>;
  flattenTree: (rows: any[], childrenKey: string, filteredIds: Set<any> | null) => DataItem[];
}

export function createTreeEngine(): TreeEngine {
  let collapsedIds: Set<any> = new Set();

  const getCollapsedIds = () => collapsedIds;
  const isExpanded = (id: any) => !collapsedIds.has(id);

  const toggleNode = (id: any): Set<any> => {
    const next = new Set(collapsedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    collapsedIds = next;
    return collapsedIds;
  };

  const expandAll = (): Set<any> => {
    collapsedIds = new Set();
    return collapsedIds;
  };

  const collapseAll = (rows: any[], childrenKey: string): Set<any> => {
    collapsedIds = collectParentIds(rows, childrenKey);
    return collapsedIds;
  };

  const flatten = (rows: any[], childrenKey: string, filteredIds: Set<any> | null): DataItem[] => {
    const visibleIds = filteredIds
      ? buildVisibleIds(rows, filteredIds, childrenKey)
      : null;
    return flattenTree(rows, collapsedIds, childrenKey, visibleIds);
  };

  return { getCollapsedIds, isExpanded, toggleNode, expandAll, collapseAll, flattenTree: flatten };
}
