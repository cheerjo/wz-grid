import { describe, it, expect } from 'vitest';
import { useTree } from '@wezon/wz-grid-vue';

function makeTree() {
  return [
    { id: 1, name: 'root-1', children: [
      { id: 11, name: 'child-1-1', children: [
        { id: 111, name: 'leaf-1-1-1' },
      ] },
      { id: 12, name: 'child-1-2' },
    ] },
    { id: 2, name: 'root-2' },
  ];
}

describe('useTree', () => {
  it('returns empty array when disabled', () => {
    const rows = makeTree();
    const { flatTreeItems } = useTree(() => rows, () => false, () => 'children', () => null);
    expect(flatTreeItems.value).toEqual([]);
  });

  it('flattens tree with level and hasChildren', () => {
    const rows = makeTree();
    const { flatTreeItems } = useTree(() => rows, () => true, () => 'children', () => null);

    const summary = flatTreeItems.value.map(i => ({ id: (i as any).row.id, level: i.level, hasChildren: (i as any).hasChildren }));
    expect(summary).toEqual([
      { id: 1,   level: 0, hasChildren: true  },
      { id: 11,  level: 1, hasChildren: true  },
      { id: 111, level: 2, hasChildren: false },
      { id: 12,  level: 1, hasChildren: false },
      { id: 2,   level: 0, hasChildren: false },
    ]);
  });

  it('toggleNode collapses and expands', () => {
    const rows = makeTree();
    const { flatTreeItems, toggleNode, isExpanded } = useTree(() => rows, () => true, () => 'children', () => null);

    toggleNode(1); // collapse root-1
    expect(isExpanded(1)).toBe(false);
    expect(flatTreeItems.value.map(i => (i as any).row.id)).toEqual([1, 2]);

    toggleNode(1); // expand again
    expect(isExpanded(1)).toBe(true);
    expect(flatTreeItems.value.length).toBe(5);
  });

  it('expandAll / collapseAll work on all nodes with children', () => {
    const rows = makeTree();
    const { flatTreeItems, expandAll, collapseAll } = useTree(() => rows, () => true, () => 'children', () => null);

    collapseAll();
    // Only roots visible (root-1 and root-2)
    expect(flatTreeItems.value.map(i => (i as any).row.id)).toEqual([1, 2]);

    expandAll();
    expect(flatTreeItems.value.length).toBe(5);
  });

  it('filter: keeps matched node + ancestors', () => {
    const rows = makeTree();
    // match leaf-1-1-1 only
    const { flatTreeItems } = useTree(
      () => rows, () => true, () => 'children', () => new Set([111])
    );
    const ids = flatTreeItems.value.map(i => (i as any).row.id);
    expect(ids).toEqual([1, 11, 111]);
  });

  it('filter with null getFilteredIds shows all nodes (no filter)', () => {
    const rows = makeTree();
    const { flatTreeItems } = useTree(() => rows, () => true, () => 'children', () => null);
    expect(flatTreeItems.value.length).toBe(5);
  });
});
