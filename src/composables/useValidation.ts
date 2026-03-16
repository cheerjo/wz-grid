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

  // 검증이 필요한 컬럼만 필터링 (required 또는 validator가 있는 컬럼)
  const getValidatableColumns = (): Column[] =>
    getColumns().filter(col => col.required || col.validator);

  // 이전 rows 스냅샷을 id → row 레퍼런스 맵으로 유지 — 변경된 행만 재검증
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
        // 새 행이거나, 레퍼런스가 바뀐 행만 재검증
        if (!prev || prev !== row) {
          for (const col of cols) validateCell(row, col, row[col.key]);
        }
      }

      // 삭제된 행의 오류 항목 정리
      for (const id of prevRowMap.keys()) {
        if (!nextRowMap.has(id)) {
          for (const col of getColumns()) delete errors[`${id}:${col.key}`];
        }
      }

      prevRowMap = nextRowMap;
    }, 50);
  };

  // 초기 실행: 검증 가능한 컬럼이 있는 경우에만 전체 검증
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
    { deep: false }  // 배열 참조 변경만 감지 — 깊은 감시 대신 행 레퍼런스 비교로 최적화
  );

  return { errors, validateCell };
}
