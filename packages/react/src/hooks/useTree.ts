// packages/react/src/hooks/useTree.ts
import { useState, useMemo, useCallback } from 'react';
import { flattenTree, buildVisibleIds, collectParentIds } from '@wezon/wz-grid-core';
import type { DataItem } from '@wezon/wz-grid-core';

export interface UseTreeReturn {
  /** 접힌 노드 id Set */
  collapsedIds: Set<any>;
  /** 노드 펼침/접힘 토글 */
  toggleNode: (id: any) => void;
  /** 전체 펼치기 */
  expandAll: () => void;
  /** 전체 접기 */
  collapseAll: () => void;
  /** 노드가 펼쳐져 있는지 */
  isExpanded: (id: any) => boolean;
  /** 필터·접힘 상태가 반영된 평탄화 트리 아이템 목록 */
  flatItems: DataItem[];
}

export function useTree(
  rows: any[],
  options: {
    childrenKey?: string;
    filteredIds?: Set<any> | null;
  } = {}
): UseTreeReturn {
  const { childrenKey = 'children', filteredIds = null } = options;
  const [collapsedIds, setCollapsedIds] = useState<Set<any>>(new Set());

  const isExpanded = useCallback(
    (id: any) => !collapsedIds.has(id),
    [collapsedIds]
  );

  const toggleNode = useCallback((id: any) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedIds(collectParentIds(rows, childrenKey));
  }, [rows, childrenKey]);

  const flatItems = useMemo(() => {
    const visibleIds =
      filteredIds != null
        ? buildVisibleIds(rows, filteredIds, childrenKey)
        : null;
    return flattenTree(rows, collapsedIds, childrenKey, visibleIds);
  }, [rows, collapsedIds, childrenKey, filteredIds]);

  return { collapsedIds, toggleNode, expandAll, collapseAll, isExpanded, flatItems };
}
