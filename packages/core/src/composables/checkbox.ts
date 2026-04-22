// packages/core/src/composables/checkbox.ts
// No Vue dependency — pure TypeScript

export interface CheckboxState {
  checkedIds: Set<any>;
}

export interface CheckboxEngine {
  getCheckedIds: () => Set<any>;
  isAllChecked: (filteredRows: any[]) => boolean;
  isIndeterminate: (filteredRows: any[]) => boolean;
  checkedCount: () => number;
  isRowChecked: (id: any) => boolean;
  toggleAll: (filteredRows: any[], allRows: any[], onCheckedChange: (checked: any[]) => void) => void;
  toggleRow: (id: any, allRows: any[], onCheckedChange: (checked: any[]) => void) => void;
  /** rows가 교체될 때 체크 상태 초기화 */
  reset: () => void;
}

export function createCheckboxEngine(): CheckboxEngine {
  let checkedIds: Set<any> = new Set();

  const getCheckedIds = () => checkedIds;
  const checkedCount = () => checkedIds.size;
  const isRowChecked = (id: any) => checkedIds.has(id);

  const isAllChecked = (filteredRows: any[]): boolean =>
    filteredRows.length > 0 && filteredRows.every(r => checkedIds.has(r.id));

  const isIndeterminate = (filteredRows: any[]): boolean =>
    !isAllChecked(filteredRows) && filteredRows.some(r => checkedIds.has(r.id));

  const toggleAll = (
    filteredRows: any[],
    allRows: any[],
    onCheckedChange: (checked: any[]) => void
  ) => {
    const next = new Set(checkedIds);
    const allChecked = filteredRows.every(r => next.has(r.id));
    filteredRows.forEach(r => allChecked ? next.delete(r.id) : next.add(r.id));
    checkedIds = next;
    onCheckedChange(allRows.filter(r => checkedIds.has(r.id)));
  };

  const toggleRow = (
    id: any,
    allRows: any[],
    onCheckedChange: (checked: any[]) => void
  ) => {
    const next = new Set(checkedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    checkedIds = next;
    onCheckedChange(allRows.filter(r => checkedIds.has(r.id)));
  };

  const reset = () => { checkedIds = new Set(); };

  return { getCheckedIds, isAllChecked, isIndeterminate, checkedCount, isRowChecked, toggleAll, toggleRow, reset };
}
