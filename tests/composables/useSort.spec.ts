import { describe, it, expect, vi } from 'vitest';
import { useSort } from '@wezon/wz-grid-vue';
import type { Column, GridRow } from '@wezon/wz-grid-core';

function makeRows(): GridRow[] {
  return [
    { id: 1, name: '철수', age: 20,  joinedAt: '2024-01-10', priority: '' },
    { id: 2, name: '영희', age: 30,  joinedAt: '2023-05-20', priority: 'high' },
    { id: 3, name: 'alice', age: 9,   joinedAt: '2025-03-01', priority: 'low' },
    { id: 4, name: 'bob',   age: 100, joinedAt: '2022-12-12', priority: 'mid' },
  ];
}

const numCol:  Column = { key: 'age',      title: '나이',   type: 'number' };
const strCol:  Column = { key: 'name',     title: '이름',   type: 'text'   };
const dateCol: Column = { key: 'joinedAt', title: '가입일', type: 'date'   };
const tagCol:  Column = { key: 'tags',     title: '태그',   type: 'tag'    };

const fakeEvent = (opts: Partial<MouseEvent> = {}): MouseEvent => ({ shiftKey: false, ...opts } as MouseEvent);

describe('useSort', () => {
  it('returns original rows when no sort config', () => {
    const rows = makeRows();
    const { sortedRows } = useSort(() => {}, () => rows, () => false, () => [numCol]);
    expect(sortedRows.value).toEqual(rows);
  });

  it('sorts numbers ascending/descending via toggleSort', () => {
    const onSort = vi.fn();
    const rows = makeRows();
    const { sortedRows, toggleSort, sortConfigs } = useSort(onSort, () => rows, () => false, () => [numCol]);

    toggleSort('age', fakeEvent());
    expect(sortConfigs.value).toEqual([{ key: 'age', order: 'asc' }]);
    expect(sortedRows.value.map(r => r.age)).toEqual([9, 20, 30, 100]);
    expect(onSort).toHaveBeenCalledTimes(1);

    toggleSort('age', fakeEvent());
    expect(sortConfigs.value).toEqual([{ key: 'age', order: 'desc' }]);
    expect(sortedRows.value.map(r => r.age)).toEqual([100, 30, 20, 9]);
  });

  it('auto-detects date (ISO) strings', () => {
    const rows = makeRows();
    const { sortedRows, toggleSort } = useSort(() => {}, () => rows, () => false, () => [dateCol]);

    toggleSort('joinedAt', fakeEvent());
    expect(sortedRows.value.map(r => r.joinedAt)).toEqual([
      '2022-12-12', '2023-05-20', '2024-01-10', '2025-03-01',
    ]);
  });

  it('pushes empty strings to the bottom regardless of order', () => {
    const rows: GridRow[] = [
      { id: 1, priority: 'high' },
      { id: 2, priority: ''     },
      { id: 3, priority: 'low'  },
    ];
    const priorityCol: Column = { key: 'priority', title: '우선순위', type: 'text' };
    const { sortedRows, toggleSort } = useSort(() => {}, () => rows, () => false, () => [priorityCol]);

    toggleSort('priority', fakeEvent());
    expect(sortedRows.value.at(-1)!.priority).toBe('');
  });

  it('serverSide=true returns original rows even with sortConfigs', () => {
    const rows = makeRows();
    let serverSide = true;
    const { sortedRows, toggleSort } = useSort(() => {}, () => rows, () => serverSide, () => [numCol]);

    toggleSort('age', fakeEvent());
    expect(sortedRows.value).toEqual(rows);
  });

  it('Shift+Click accumulates multi-sort configs', () => {
    const rows = makeRows();
    const { toggleSort, sortConfigs } = useSort(() => {}, () => rows, () => false, () => [numCol, strCol]);

    toggleSort('age',  fakeEvent());
    toggleSort('name', fakeEvent({ shiftKey: true }));
    expect(sortConfigs.value).toEqual([
      { key: 'age',  order: 'asc' },
      { key: 'name', order: 'asc' },
    ]);

    // Shift click again on 'name' flips to desc
    toggleSort('name', fakeEvent({ shiftKey: true }));
    expect(sortConfigs.value[1]).toEqual({ key: 'name', order: 'desc' });

    // Shift click third time removes 'name'
    toggleSort('name', fakeEvent({ shiftKey: true }));
    expect(sortConfigs.value).toEqual([{ key: 'age', order: 'asc' }]);
  });

  it('type=tag sorts by array length', () => {
    const rows: GridRow[] = [
      { id: 1, tags: ['a', 'b', 'c'] },
      { id: 2, tags: [] },
      { id: 3, tags: ['x'] },
    ];
    const { sortedRows, toggleSort } = useSort(() => {}, () => rows, () => false, () => [tagCol]);

    toggleSort('tags', fakeEvent());
    expect(sortedRows.value.map(r => (r.tags as any[]).length)).toEqual([0, 1, 3]);
  });
});
