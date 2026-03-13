// src/composables/useValidation.ts
import { reactive, watch } from 'vue-demi';
import { Column } from '../types/grid';

export function useValidation(
  getRows: () => any[],
  getColumns: () => Column[]
) {
  const errors = reactive<Record<string, string>>({});

  const validateCell = (row: any, col: Column, value: any): boolean => {
    const k = `${row.id}:${col.key}`;
    if (col.required && (value === null || value === undefined || value === '')) {
      errors[k] = `${col.title}은(는) 필수 입력 항목입니다.`; return false;
    }
    if (col.validator) {
      const e = col.validator(value, row);
      if (e) { errors[k] = e; return false; }
    }
    delete errors[k]; return true;
  };

  watch(() => getRows(), (rows) => {
    rows.forEach(row => getColumns().forEach(col => validateCell(row, col, row[col.key])));
  }, { immediate: true });

  return { errors, validateCell };
}
