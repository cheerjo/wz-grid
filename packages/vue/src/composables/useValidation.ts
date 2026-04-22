// packages/vue/src/composables/useValidation.ts
import { reactive, watch, onBeforeUnmount } from 'vue-demi';
import type { Column, GridRow, TFunction } from '@anthropic/wz-grid-core';

export interface UseValidationReturn {
  /** 셀별 오류 메시지 맵. key 형식: `{rowId}:{columnKey}` */
  errors: Record<string, string>;
  /** 단일 셀 값 검증. 오류 없으면 true 반환하고 errors 맵에서 해당 항목 제거. */
  validateCell: (row: any, col: Column, value: any) => boolean;
}

export function useValidation(
  getRows: () => any[],
  getColumns: () => Column[],
  t?: TFunction
): UseValidationReturn {
  const errors = reactive<Record<string, string>>({});

  const validateCell = (row: any, col: Column, value: any): boolean => {
    const k = `${row.id}:${col.key}`;
    if (col.required && (value === null || value === undefined || value === '')) {
      errors[k] = t
        ? t('validation.required', { title: col.title })
        : `${col.title}은(는) 필수 입력 항목입니다.`;
      return false;
    }
    if (col.validator) {
      const e = col.validator(value, row);
      if (e) { errors[k] = e; return false; }
    }
    delete errors[k]; return true;
  };

  const getValidatableColumns = (): Column[] =>
    getColumns().filter(col => col.required || col.validator);

  let prevRowMap = new Map<any, any>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleValidation = (rows: any[]) => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const cols = getValidatableColumns();
      if (cols.length === 0) return;

      const nextRowMap = new Map<any, any>();
      for (const row of rows) {
        nextRowMap.set(row.id, row);
        const prev = prevRowMap.get(row.id);
        if (!prev || prev !== row) {
          for (const col of cols) validateCell(row, col, row[col.key]);
        }
      }

      for (const id of prevRowMap.keys()) {
        if (!nextRowMap.has(id)) {
          for (const col of getColumns()) delete errors[`${id}:${col.key}`];
        }
      }

      prevRowMap = nextRowMap;
    }, 50);
  };

  onBeforeUnmount(() => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  });

  const runInitial = () => {
    const rows = getRows();
    const cols = getValidatableColumns();
    if (cols.length === 0) return;
    prevRowMap = new Map(rows.map(r => [r.id, r]));
    for (const row of rows) {
      for (const col of cols) validateCell(row, col, row[col.key]);
    }
  };
  runInitial();

  watch(
    () => getRows(),
    (rows) => scheduleValidation(rows),
    { deep: false }
  );

  return { errors, validateCell };
}

// runStructureValidation은 코어에서 re-export됨
export { runStructureValidation } from '@anthropic/wz-grid-core';
