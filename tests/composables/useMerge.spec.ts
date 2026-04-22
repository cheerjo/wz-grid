import { describe, it, expect } from 'vitest';
import { ref } from 'vue-demi';
import { useMerge } from 'wz-grid-vue';
import type { Column, GridItem } from '@wezon/wz-grid-core';

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

  // ── getMergeSpan: 병합+가상 스크롤 부분 지원용 ───────────────────────
  describe('getMergeSpan', () => {
    it('no merge → null', () => {
      const items = toItems([{ id: 1, region: 'A' }, { id: 2, region: 'B' }]);
      const { getMergeSpan } = useMerge(() => items, () => cols, () => ['region'], () => null);
      expect(getMergeSpan(0)).toBeNull();
      expect(getMergeSpan(1)).toBeNull();
    });

    it('autoMerge 블록의 모든 행에 동일 span 반환', () => {
      const rows = [
        { id: 1, region: 'A', team: 'dev' },
        { id: 2, region: 'A', team: 'dev' },
        { id: 3, region: 'A', team: 'ops' },
        { id: 4, region: 'B', team: 'ops' },
      ];
      const { getMergeSpan } = useMerge(
        () => toItems(rows), () => cols, () => ['region'], () => null
      );
      // region 'A'는 0..2 → span=[0, 3)
      expect(getMergeSpan(0)).toEqual({ start: 0, end: 3 });
      expect(getMergeSpan(1)).toEqual({ start: 0, end: 3 });
      expect(getMergeSpan(2)).toEqual({ start: 0, end: 3 });
      // region 'B'는 단일 행 → 병합 아님
      expect(getMergeSpan(3)).toBeNull();
    });

    it('여러 컬럼의 병합이 겹치면 가장 넓은 범위로 확장', () => {
      const rows = [
        { id: 1, region: 'A', team: 'dev' },
        { id: 2, region: 'A', team: 'dev' },
        { id: 3, region: 'A', team: 'ops' },
        { id: 4, region: 'A', team: 'ops' },
      ];
      // region: 0..3 (span=[0,4)), team: dev 0..1, ops 2..3
      const { getMergeSpan } = useMerge(
        () => toItems(rows), () => cols, () => ['region', 'team'], () => null
      );
      // 모든 행이 region 블록에 포함 → 가장 넓은 span=[0,4)
      expect(getMergeSpan(0)).toEqual({ start: 0, end: 4 });
      expect(getMergeSpan(1)).toEqual({ start: 0, end: 4 });
      expect(getMergeSpan(2)).toEqual({ start: 0, end: 4 });
      expect(getMergeSpan(3)).toEqual({ start: 0, end: 4 });
    });

    it('mergeCells 콜백의 rowspan도 span으로 노출', () => {
      const rows = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const { getMergeSpan } = useMerge(
        () => toItems(rows), () => cols, () => [],
        () => (row, colKey) => row.id === 1 && colKey === 'region' ? { rowspan: 3, colspan: 1 } : null,
      );
      // rowspan=3 at item 0 → span=[0, 3)
      expect(getMergeSpan(0)).toEqual({ start: 0, end: 3 });
      expect(getMergeSpan(1)).toEqual({ start: 0, end: 3 });
      expect(getMergeSpan(2)).toEqual({ start: 0, end: 3 });
      expect(getMergeSpan(3)).toBeNull();
    });
  });
});
