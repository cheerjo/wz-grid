// src/composables/useValidation.ts
import { reactive, watch } from 'vue-demi';
import type { Column, GridRow } from '../types/grid';
import type { TFunction } from './useI18n';

export interface UseValidationReturn {
  /** 셀별 오류 메시지 맵. key 형식: `{rowId}:{columnKey}` */
  errors: Record<string, string>;
  /** 단일 셀 값 검증. 오류 없으면 true 반환하고 errors 맵에서 해당 항목 제거. */
  validateCell: (row: any, col: Column, value: any) => boolean;
}

/**
 * 그리드 데이터 유효성 검사 Composable.
 * 실시간 입력 검증 및 행 변경 시 자동 검증을 수행합니다.
 */
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

/**
 * 그리드 데이터 구조를 검증하는 유틸리티 함수.
 * debug=true이면 console.warn, strict=true이면 console.error로 더 강력한 검증을 수행합니다.
 * strict=true는 debug=true를 포함합니다.
 */
export function runStructureValidation(
  rows: GridRow[],
  columns: Column[],
  options: { debug?: boolean; strict?: boolean }
): void {
  const { debug = false, strict = false } = options;
  if (!debug && !strict) return;

  // ── Debug 레벨 검증 (console.warn) ──────────────────────────────
  // id 누락 (개수 단위 경고)
  const missingIdRows = rows.filter(r => r.id === undefined || r.id === null);
  if (missingIdRows.length > 0 && !strict) {
    console.warn(`[WZGrid debug] rows에 id 필드가 누락된 항목이 ${missingIdRows.length}개 있습니다.`, missingIdRows);
  }

  // columns.key가 row 데이터에 없는 경우
  if (rows.length > 0 && !strict) {
    const sampleRow = rows[0];
    columns.forEach(col => {
      if (!(col.key in sampleRow)) {
        console.warn(`[WZGrid debug] column key "${col.key}"가 row 데이터에 존재하지 않습니다.`);
      }
    });
  }

  // type: 'select'인데 options 미지정
  if (!strict) {
    columns.forEach(col => {
      if (col.type === 'select' && (!col.options || col.options.length === 0)) {
        console.warn(`[WZGrid debug] column "${col.key}"는 type이 'select'이지만 options가 지정되지 않았습니다.`);
      }
    });
  }

  // ── Strict 레벨 검증 (console.error) ───────────────────────────
  if (strict) {
    // id 누락 — 행 인덱스와 함께 출력
    rows.forEach((row, idx) => {
      if (row.id === undefined || row.id === null) {
        console.error(`[WZGrid strict] rows[${idx}]에 id 필드가 없습니다.`, row);
      }
    });

    // 중복 id 감지
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

    // column key와 row 데이터 불일치
    if (rows.length > 0) {
      const sampleRow = rows[0];
      columns.forEach(col => {
        if (!(col.key in sampleRow)) {
          console.error(`[WZGrid strict] column key "${col.key}"가 row 데이터에 존재하지 않습니다.`);
        }
      });
    }

    // type: 'number' | 'currency'인데 문자열 데이터
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

    // type: 'select'인데 options 미지정
    columns.forEach(col => {
      if (col.type === 'select' && (!col.options || col.options.length === 0)) {
        console.error(`[WZGrid strict] column "${col.key}"는 type이 'select'이지만 options가 지정되지 않았습니다.`);
      }
    });
  }
}
