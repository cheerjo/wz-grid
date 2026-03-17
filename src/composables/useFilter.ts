// src/composables/useFilter.ts
import { reactive, computed, watch } from 'vue-demi';
import { Column } from '../types/grid';

export function useFilter(
  getRows: () => any[],
  getColumns: () => Column[],
  isEnabled: () => boolean
) {
  const filters = reactive<Record<string, any>>({});

  const initFilter = (col: Column) => {
    if (filters[col.key] !== undefined) return;
    if (col.type === 'number' || col.type === 'currency' || col.type === 'rating') filters[col.key] = { min: '', max: '' };
    else if (col.type === 'date' || col.type === 'datetime') filters[col.key] = { from: '', to: '' };
    else if (col.type === 'select' || col.type === 'badge') filters[col.key] = { values: [] as any[], value: '' };
    else                                                filters[col.key] = { value: '' };
  };

  watch(() => getColumns(), (cols) => cols.forEach(initFilter), { immediate: true });

  const isFilterActive = (key: string): boolean => {
    const f = filters[key];
    if (!f) return false;
    // values 배열이 비어 있어도 value 텍스트 검색이 활성일 수 있으므로 둘 다 확인
    if ('values' in f && (f.values as any[]).length > 0) return true;
    if ('value' in f && String(f.value ?? '') !== '') return true;
    if ('min' in f || 'max' in f) return String(f.min ?? '') !== '' || String(f.max ?? '') !== '';
    if ('from' in f || 'to' in f) return String(f.from ?? '') !== '' || String(f.to ?? '') !== '';
    return false;
  };

  const activeFilterCount = computed(() => getColumns().filter(col => isFilterActive(col.key)).length);

  const clearFilter = (key: string) => {
    const f = filters[key];
    if (!f) return;
    if ('values' in f) f.values = [];
    if ('value' in f) f.value = '';
    if ('min' in f)   f.min = '';
    if ('max' in f)   f.max = '';
    if ('from' in f)  f.from = '';
    if ('to' in f)    f.to = '';
  };

  const clearAllFilters = () => getColumns().forEach(col => clearFilter(col.key));

  const filteredRows = computed(() => {
    if (!isEnabled()) return getRows();
    return getRows().filter(row => {
      for (const col of getColumns()) {
        if (!isFilterActive(col.key)) continue;
        const f   = filters[col.key];
        const val = row[col.key];

        if (col.type === 'number' || col.type === 'currency' || col.type === 'rating') {
          const n = Number(val ?? 0);
          if (f.min !== '' && n < Number(f.min)) return false;
          if (f.max !== '' && n > Number(f.max)) return false;
        } else if (col.type === 'tag') {
          // 배열 항목 중 하나라도 쿼리를 포함하면 통과
          const query = String(f.value ?? '').toLowerCase();
          if (query) {
            const tags: string[] = Array.isArray(val) ? val : [];
            const matched = tags.some(t => String(t).toLowerCase().includes(query));
            if (!matched) return false;
          }
        } else if (col.type === 'date') {
          const s = String(val ?? '');
          if (f.from && s < f.from) return false;
          if (f.to   && s > f.to)   return false;
        } else if (col.type === 'datetime') {
          // ISO 문자열 앞 16자리(YYYY-MM-DDTHH:mm)로 비교
          const s = String(val ?? '').substring(0, 16);
          if (f.from && s < f.from) return false;
          if (f.to   && s > f.to)   return false;
        } else if (col.type === 'boolean') {
          if (f.value === 'true'  && !val) return false;
          if (f.value === 'false' &&  val) return false;
        } else if ('values' in f && Array.isArray(f.values) && f.values.length > 0) {
          // 다중 선택 필터 (select / badge)
          if (!f.values.includes(val)) return false;
        } else {
          const text  = String(val ?? '').toLowerCase();
          const query = String(f.value ?? '').toLowerCase();
          if (query && !text.includes(query)) return false;
        }
      }
      return true;
    });
  });

  return { filters, isFilterActive, activeFilterCount, clearFilter, clearAllFilters, filteredRows };
}
