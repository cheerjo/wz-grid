// packages/vue/src/composables/useCheckbox.ts
import { ref, computed, watch } from 'vue-demi';
import type { Ref, ComputedRef } from 'vue-demi';

export interface UseCheckboxReturn {
  /** 체크된 행 id Set */
  checkedIds: Ref<Set<any>>;
  /** 현재 페이지 행 전체가 체크된 상태인지 */
  isAllChecked: ComputedRef<boolean>;
  /** 일부만 체크된 중간 상태 */
  isIndeterminate: ComputedRef<boolean>;
  /** 체크된 행 수 */
  checkedCount: ComputedRef<number>;
  /** 특정 행이 체크된 상태인지 */
  isRowChecked: (id: any) => boolean;
  /** 전체 선택/해제 토글 */
  toggleAll: () => void;
  /** 특정 행 체크 토글 */
  toggleRow: (id: any) => void;
}

export function useCheckbox(
  getFilteredRows: () => any[],
  getAllRows: () => any[],
  onCheckedChange: (checked: any[]) => void
): UseCheckboxReturn {
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

  return { checkedIds, isAllChecked, isIndeterminate, checkedCount, isRowChecked, toggleAll, toggleRow };
}
