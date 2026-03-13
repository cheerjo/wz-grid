// src/composables/useSort.ts
import { ref } from 'vue-demi';
import { SortConfig } from '../types/grid';

export function useSort(onSort: (configs: SortConfig[]) => void) {
  const sortConfigs = ref<SortConfig[]>([]);

  const getSortEntry = (key: string) => sortConfigs.value.find(s => s.key === key);
  const getSortIndex = (key: string) => sortConfigs.value.findIndex(s => s.key === key);

  const toggleSort = (key: string, e: MouseEvent) => {
    const existing = sortConfigs.value.find(s => s.key === key);
    if (e.shiftKey) {
      if (!existing) {
        sortConfigs.value = [...sortConfigs.value, { key, order: 'asc' }];
      } else if (existing.order === 'asc') {
        sortConfigs.value = sortConfigs.value.map(s => s.key === key ? { ...s, order: 'desc' as const } : s);
      } else {
        sortConfigs.value = sortConfigs.value.filter(s => s.key !== key);
      }
    } else {
      if (existing && sortConfigs.value.length === 1) {
        sortConfigs.value = [{ key, order: existing.order === 'asc' ? 'desc' : 'asc' }];
      } else {
        sortConfigs.value = [{ key, order: 'asc' }];
      }
    }
    onSort(sortConfigs.value);
  };

  return { sortConfigs, getSortEntry, getSortIndex, toggleSort };
}
