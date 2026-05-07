import { describe, it, expect } from 'vitest';
import { useGrouping } from '@wezon/wz-grid-vue';
import type { Column } from '@wezon/wz-grid-core';

const cols: Column[] = [
  { key: 'region',  title: '지역', type: 'text'   },
  { key: 'revenue', title: '매출', type: 'number' },
  { key: 'flag',    title: 'flag', type: 'boolean' },
];

const rows = [
  { id: 1, region: 'A', revenue: 100, flag: true  },
  { id: 2, region: 'A', revenue: 200, flag: false },
  { id: 3, region: 'B', revenue: 50,  flag: true  },
];

describe('useGrouping', () => {
  it('no groupBy → flat data items only', () => {
    const { flatGroupedItems } = useGrouping(() => rows, () => '', () => cols, () => cols);
    expect(flatGroupedItems.value.every(i => i.type === 'data')).toBe(true);
    expect(flatGroupedItems.value.length).toBe(rows.length);
  });

  it('groupBy creates group-header, data, subtotal items per group', () => {
    const { flatGroupedItems } = useGrouping(() => rows, () => 'region', () => cols, () => cols);

    const types = flatGroupedItems.value.map(i => i.type);
    expect(types).toEqual([
      'group-header', 'data', 'data', 'subtotal',
      'group-header', 'data',          'subtotal',
    ]);

    const subtotalA = flatGroupedItems.value[3] as any;
    expect(subtotalA.sums.revenue).toBe(300);

    const subtotalB = flatGroupedItems.value[6] as any;
    expect(subtotalB.sums.revenue).toBe(50);
  });

  it('collapsed group hides data rows and subtotal', () => {
    const { flatGroupedItems, toggleGroup } = useGrouping(() => rows, () => 'region', () => cols, () => cols);
    toggleGroup('A');

    const types = flatGroupedItems.value.map(i => i.type);
    // group-header(A collapsed), group-header(B), data, subtotal
    expect(types).toEqual(['group-header', 'group-header', 'data', 'subtotal']);
    const headerA = flatGroupedItems.value[0] as any;
    expect(headerA.collapsed).toBe(true);
    expect(headerA.count).toBe(2);
  });

  it('boolean groupBy labels render as 예/아니요', () => {
    const { flatGroupedItems } = useGrouping(() => rows, () => 'flag', () => cols, () => cols);
    const labels = flatGroupedItems.value
      .filter(i => i.type === 'group-header')
      .map((i: any) => i.label)
      .sort();
    expect(labels).toEqual(['아니요', '예']);
  });
});
