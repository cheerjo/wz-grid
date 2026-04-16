import { describe, it, expect } from 'vitest';
import { ref } from 'vue-demi';
import { useMerge } from '../../src/composables/useMerge';
import type { Column, GridItem } from '../../src/types/grid';

const cols: Column[] = [
  { key: 'region', title: '지역', type: 'text' },
  { key: 'team',   title: '팀',   type: 'text' },
  { key: 'name',   title: '이름', type: 'text' },
];

function toItems(rows: any[]): GridItem[] {
  return rows.map(row => ({ type: 'data' as const, row }));
}

describe('useMerge', () => {
  it('hasActiveMerge=false when no config provided', () => {
    const items = toItems([{ id: 1, region: 'A' }, { id: 2, region: 'A' }]);
    const { hasActiveMerge } = useMerge(() => items, () => cols, () => [], () => null);
    expect(hasActiveMerge.value).toBe(false);
  });

  it('autoMergeCols: merges adjacent duplicate values', () => {
    const rows = [
      { id: 1, region: 'A', team: 'dev', name: 'a' },
      { id: 2, region: 'A', team: 'dev', name: 'b' },
      { id: 3, region: 'A', team: 'ops', name: 'c' },
      { id: 4, region: 'B', team: 'ops', name: 'd' },
    ];
    const items = toItems(rows);
    const { getMerge, hasActiveMerge } = useMerge(
      () => items, () => cols, () => ['region'], () => null
    );

    expect(hasActiveMerge.value).toBe(true);

    // region 'A' has rowspan=3 at item 0, hidden at items 1,2
    expect(getMerge(0, 'region')).toEqual({ rowspan: 3, colspan: 1, hidden: false });
    expect(getMerge(1, 'region')).toMatchObject({ hidden: true });
    expect(getMerge(2, 'region')).toMatchObject({ hidden: true });
    // region 'B' is a single row — no merge state emitted
    expect(getMerge(3, 'region')).toBeUndefined();
  });

  it('autoMergeCols: re-computes when paged items change', () => {
    const rows = ref([
      { id: 1, region: 'A' }, { id: 2, region: 'A' }, { id: 3, region: 'B' },
    ]);
    const { getMerge } = useMerge(
      () => toItems(rows.value), () => cols, () => ['region'], () => null
    );
    expect(getMerge(0, 'region')).toEqual({ rowspan: 2, colspan: 1, hidden: false });

    // Simulate sorting/filtering by replacing the reactive ref value
    rows.value = [
      { id: 3, region: 'B' }, { id: 1, region: 'A' }, { id: 2, region: 'A' },
    ];
    // now computed invalidates and recomputes
    expect(getMerge(0, 'region')).toBeUndefined(); // 'B' single row
    expect(getMerge(1, 'region')).toEqual({ rowspan: 2, colspan: 1, hidden: false });
  });

  it('mergeCells callback: clamps rowspan/colspan to paged bounds', () => {
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const items = toItems(rows);
    // Return absurd rowspan=99 for row 1 col 'region' — should clamp to 3
    const { getMerge } = useMerge(
      () => items, () => cols, () => [],
      () => (row, colKey) => row.id === 1 && colKey === 'region' ? { rowspan: 99, colspan: 99 } : null
    );
    const m = getMerge(0, 'region');
    expect(m?.rowspan).toBe(3);
    expect(m?.colspan).toBe(cols.length);
    expect(getMerge(1, 'region')?.hidden).toBe(true);
    expect(getMerge(2, 'region')?.hidden).toBe(true);
  });

  it('mergeCells callback: 1x1 or negative merges are ignored', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const items = toItems(rows);
    const { getMerge } = useMerge(
      () => items, () => cols, () => [],
      () => () => ({ rowspan: 1, colspan: 1 })
    );
    // 1x1 merge is no-op → no entry
    expect(getMerge(0, 'region')).toBeUndefined();
  });

  it('skips autoMerge for hidden/unknown column keys', () => {
    const rows = [{ id: 1, region: 'A' }, { id: 2, region: 'A' }];
    const { getMerge } = useMerge(
      () => toItems(rows), () => cols, () => ['__does_not_exist__'], () => null
    );
    expect(getMerge(0, '__does_not_exist__')).toBeUndefined();
  });
});
