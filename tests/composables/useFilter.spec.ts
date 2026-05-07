import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue-demi';
import { useFilter } from '@wezon/wz-grid-vue';
import type { Column } from '@wezon/wz-grid-core';

const cols = (): Column[] => [
  { key: 'name',  title: '이름',   type: 'text'   },
  { key: 'age',   title: '나이',   type: 'number' },
  { key: 'role',  title: '역할',   type: 'select', options: [
      { value: 'admin', label: '관리자' },
      { value: 'user',  label: '사용자' },
  ] },
  { key: 'date',  title: '가입일', type: 'date'   },
  { key: 'tags',  title: '태그',   type: 'tag'    },
  { key: 'flag',  title: '활성',   type: 'boolean' },
];

const makeRows = () => [
  { id: 1, name: '철수', age: 20, role: 'admin', date: '2024-01-10', tags: ['a', 'b'], flag: true  },
  { id: 2, name: '영희', age: 30, role: 'user',  date: '2023-05-20', tags: ['c'],      flag: false },
  { id: 3, name: 'alice', age: 9, role: 'user',  date: '2025-03-01', tags: [],         flag: true  },
];

describe('useFilter', () => {
  it('returns original rows when isEnabled=false', async () => {
    const rows = makeRows();
    const { filteredRows, filters } = useFilter(() => rows, cols, () => false);
    await nextTick();
    filters.name.value = '철수';
    expect(filteredRows.value).toEqual(rows);
  });

  it('text contains filter is case-insensitive', async () => {
    const rows = makeRows();
    const { filteredRows, filters, isFilterActive, activeFilterCount } = useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.name.value = 'AL';
    expect(filteredRows.value.map(r => r.name)).toEqual(['alice']);
    expect(isFilterActive('name')).toBe(true);
    expect(activeFilterCount.value).toBe(1);
  });

  it('number filter uses min/max bounds', async () => {
    const rows = makeRows();
    const { filteredRows, filters } = useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.age.min = '15';
    filters.age.max = '25';
    expect(filteredRows.value.map(r => r.age)).toEqual([20]);
  });

  it('select filter with multi-values keeps only matching rows', async () => {
    const rows = makeRows();
    const { filteredRows, filters } = useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.role.values = ['user'];
    expect(filteredRows.value.map(r => r.role)).toEqual(['user', 'user']);
  });

  it('date filter uses from/to range (inclusive, string comparison)', async () => {
    const rows = makeRows();
    const { filteredRows, filters } = useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.date.from = '2023-01-01';
    filters.date.to   = '2024-12-31';
    expect(filteredRows.value.map(r => r.date).sort()).toEqual(['2023-05-20', '2024-01-10']);
  });

  it('tag filter matches any array element', async () => {
    const rows = makeRows();
    const { filteredRows, filters } = useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.tags.value = 'c';
    expect(filteredRows.value.map(r => r.id)).toEqual([2]);
  });

  it('boolean filter accepts "true"/"false" strings', async () => {
    const rows = makeRows();
    const { filteredRows, filters } = useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.flag.value = 'true';
    expect(filteredRows.value.map(r => r.flag)).toEqual([true, true]);

    filters.flag.value = 'false';
    expect(filteredRows.value.map(r => r.flag)).toEqual([false]);
  });

  it('clearFilter resets single column, clearAllFilters resets all', async () => {
    const rows = makeRows();
    const { filteredRows, filters, clearFilter, clearAllFilters, activeFilterCount } =
      useFilter(() => rows, cols, () => true);
    await nextTick();

    filters.name.value = 'a';
    filters.age.min    = '10';
    expect(activeFilterCount.value).toBe(2);

    clearFilter('name');
    expect(filters.name.value).toBe('');
    expect(activeFilterCount.value).toBe(1);

    clearAllFilters();
    expect(activeFilterCount.value).toBe(0);
    expect(filteredRows.value).toEqual(rows);
  });
});
