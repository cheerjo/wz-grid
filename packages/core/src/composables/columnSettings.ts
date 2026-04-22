// packages/core/src/composables/columnSettings.ts
// No Vue dependency — pure TypeScript
// DOM 이벤트(click outside) 등록/해제는 Vue 래퍼가 담당.
import type { Column } from '../types/grid';

export interface ColumnSettingsEngine {
  getHiddenColKeys: () => string[];
  isColVisible: (key: string) => boolean;
  toggleColVisibility: (key: string) => string[];
  getVisibleColumns: (columns: Column[]) => Column[];
  isOpen: () => boolean;
  setOpen: (value: boolean) => void;
}

export function createColumnSettingsEngine(): ColumnSettingsEngine {
  let hiddenColKeys: string[] = [];
  let open = false;

  const getHiddenColKeys = () => [...hiddenColKeys];
  const isColVisible = (key: string) => !hiddenColKeys.includes(key);

  const toggleColVisibility = (key: string): string[] => {
    if (hiddenColKeys.includes(key)) {
      hiddenColKeys = hiddenColKeys.filter(k => k !== key);
    } else {
      hiddenColKeys = [...hiddenColKeys, key];
    }
    return hiddenColKeys;
  };

  const getVisibleColumns = (columns: Column[]): Column[] =>
    columns.filter(col => !hiddenColKeys.includes(col.key));

  const isOpen = () => open;
  const setOpen = (value: boolean) => { open = value; };

  return { getHiddenColKeys, isColVisible, toggleColVisibility, getVisibleColumns, isOpen, setOpen };
}
