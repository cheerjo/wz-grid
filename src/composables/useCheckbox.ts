// src/composables/useCheckbox.ts
import { ref, computed, watch, watchEffect } from 'vue-demi';

export function useCheckbox(
  getFilteredRows: () => any[],
  getAllRows: () => any[],
  onCheckedChange: (checked: any[]) => void
) {
  const checkedIds = ref<Set<any>>(new Set());

  const isAllChecked = computed(
    () => getFilteredRows().length > 0 && getFilteredRows().every(r => checkedIds.value.has(r.id))
  );
  const isIndeterminate = computed(
    () => !isAllChecked.value && getFilteredRows().some(r => checkedIds.value.has(r.id))
  );
  const checkedCount = computed(() => checkedIds.value.size);
  const isRowChecked = (id: any) => checkedIds.value.has(id);

  const emitChecked = () => onCheckedChange(getAllRows().filter(r => checkedIds.value.has(r.id)));

  const toggleAll = () => {
    const next = new Set(checkedIds.value);
    const allChecked = getFilteredRows().every(r => next.has(r.id));
    getFilteredRows().forEach(r => allChecked ? next.delete(r.id) : next.add(r.id));
    checkedIds.value = next;
    emitChecked();
  };

  const toggleRow = (id: any) => {
    const next = new Set(checkedIds.value);
    next.has(id) ? next.delete(id) : next.add(id);
    checkedIds.value = next;
    emitChecked();
  };

  watch(() => getAllRows(), () => { checkedIds.value = new Set(); }, { deep: false });

  const headerCheckboxEl = ref<HTMLInputElement | null>(null);
  watchEffect(() => {
    if (headerCheckboxEl.value) headerCheckboxEl.value.indeterminate = isIndeterminate.value;
  });

  return { checkedIds, isAllChecked, checkedCount, isRowChecked, toggleAll, toggleRow, headerCheckboxEl };
}
