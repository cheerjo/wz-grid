// packages/core/src/composables/validation.ts
// No Vue dependency — pure TypeScript
// watch / onBeforeUnmount 등 lifecycle은 Vue 래퍼가 담당.
import type { Column, GridRow } from '../types/grid';
import type { TFunction } from './i18n';

/** 셀별 오류 메시지 맵. key 형식: `{rowId}:{columnKey}` */
export type ErrorsMap = Record<string, string>;

// ─── 순수 함수 ────────────────────────────────────────────────────────────────

/** 단일 셀 값 검증. 오류 없으면 undefined, 오류 있으면 메시지 문자열 반환. */
export function validateCellValue(
  row: any,
  col: Column,
  value: any,
  t?: TFunction
): string | undefined {
  if (col.required && (value === null || value === undefined || value === '')) {
    return t
      ? t('validation.required', { title: col.title })
      : `${col.title}은(는) 필수 입력 항목입니다.`;
  }
  if (col.validator) {
    const e = col.validator(value, row);
    if (e) return e;
  }
  return undefined;
}

/**
 * 그리드 데이터 구조를 검증하는 유틸리티 함수.
 * debug=true이면 console.warn, strict=true이면 console.error로 더 강력한 검증을 수행.
 */
export function runStructureValidation(
  rows: GridRow[],
  columns: Column[],
  options: { debug?: boolean; strict?: boolean }
): void {
  const { debug = false, strict = false } = options;
  if (!debug && !strict) return;

  const missingIdRows = rows.filter(r => r.id === undefined || r.id === null);
  if (missingIdRows.length > 0 && !strict) {
    console.warn(`[WZGrid debug] rows에 id 필드가 누락된 항목이 ${missingIdRows.length}개 있습니다.`, missingIdRows);
  }

  if (rows.length > 0 && !strict) {
    const sampleRow = rows[0];
    columns.forEach(col => {
      if (!(col.key in sampleRow)) {
        console.warn(`[WZGrid debug] column key "${col.key}"가 row 데이터에 존재하지 않습니다.`);
      }
    });
  }

  if (!strict) {
    columns.forEach(col => {
      if (col.type === 'select' && (!col.options || col.options.length === 0)) {
        console.warn(`[WZGrid debug] column "${col.key}"는 type이 'select'이지만 options가 지정되지 않았습니다.`);
      }
    });
  }

  if (strict) {
    rows.forEach((row, idx) => {
      if (row.id === undefined || row.id === null) {
        console.error(`[WZGrid strict] rows[${idx}]에 id 필드가 없습니다.`, row);
      }
    });

    const idMap = new Map<any, number[]>();
    rows.forEach((row, idx) => {
      if (row.id !== undefined && row.id !== null) {
        const arr = idMap.get(row.id) ?? [];
        arr.push(idx);
        idMap.set(row.id, arr);
      }
    });
    const duplicates = [...idMap.entries()].filter(([, idxs]) => idxs.length > 1);
    if (duplicates.length > 0) {
      console.error(
        `[WZGrid strict] 중복된 id가 ${duplicates.length}개 발견되었습니다.`,
        duplicates.map(([id, idxs]) => ({ id, indices: idxs }))
      );
    }

    if (rows.length > 0) {
      const sampleRow = rows[0];
      columns.forEach(col => {
        if (!(col.key in sampleRow)) {
          console.error(`[WZGrid strict] column key "${col.key}"가 row 데이터에 존재하지 않습니다.`);
        }
      });
    }

    const numberCols = columns.filter(col => col.type === 'number' || col.type === 'currency');
    if (numberCols.length > 0) {
      rows.forEach((row, idx) => {
        numberCols.forEach(col => {
          const val = row[col.key];
          if (val !== undefined && val !== null && val !== '' && typeof val === 'string' && isNaN(Number(val))) {
            console.error(
              `[WZGrid strict] rows[${idx}].${col.key}: type이 '${col.type}'이지만 숫자로 변환할 수 없는 값 "${val}"입니다.`
            );
          }
        });
      });
    }

    columns.forEach(col => {
      if (col.type === 'select' && (!col.options || col.options.length === 0)) {
        console.error(`[WZGrid strict] column "${col.key}"는 type이 'select'이지만 options가 지정되지 않았습니다.`);
      }
    });
  }
}

// ─── 상태 팩토리 ─────────────────────────────────────────────────────────────

export interface ValidationEngine {
  getErrors: () => ErrorsMap;
  validateCell: (row: any, col: Column, value: any) => boolean;
  /**
   * rows 변경 시 호출. 변경된 행만 재검증하고 삭제된 행의 오류를 정리.
   * debounce는 호출자(Vue 래퍼)가 담당.
   */
  syncRows: (rows: any[], columns: Column[]) => void;
  /** 현재 prevRowMap 기준으로 전체 초기 검증 실행 */
  runInitial: (rows: any[], columns: Column[]) => void;
}

export function createValidationEngine(t?: TFunction): ValidationEngine {
  const errors: ErrorsMap = {};
  let prevRowMap = new Map<any, any>();

  const validateCell = (row: any, col: Column, value: any): boolean => {
    const k = `${row.id}:${col.key}`;
    const msg = validateCellValue(row, col, value, t);
    if (msg) {
      errors[k] = msg;
      return false;
    }
    delete errors[k];
    return true;
  };

  const getValidatableColumns = (columns: Column[]) =>
    columns.filter(col => col.required || col.validator);

  const syncRows = (rows: any[], columns: Column[]) => {
    const cols = getValidatableColumns(columns);
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
        for (const col of columns) delete errors[`${id}:${col.key}`];
      }
    }

    prevRowMap = nextRowMap;
  };

  const runInitial = (rows: any[], columns: Column[]) => {
    const cols = getValidatableColumns(columns);
    if (cols.length === 0) return;
    prevRowMap = new Map(rows.map(r => [r.id, r]));
    for (const row of rows) {
      for (const col of cols) validateCell(row, col, row[col.key]);
    }
  };

  return { getErrors: () => errors, validateCell, syncRows, runInitial };
}
