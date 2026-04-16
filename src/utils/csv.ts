// src/utils/csv.ts
import type { Column, GridRow } from '../types/grid';

/**
 * CSV injection(수식 주입) 가드 대상 prefix.
 *
 * 엑셀/Numbers/Sheets가 `=`, `+`, `-`, `@`, `\t`, `\r`로 시작하는 값을 수식으로 해석하여
 * 악성 함수(HYPERLINK, DDE 등)가 실행될 수 있습니다. OWASP 권장 완화책은 해당 접두어를
 * 감지하면 **작은따옴표(')를 앞에 추가**해 문자열로 강제 취급하는 것입니다.
 * @see https://owasp.org/www-community/attacks/CSV_Injection
 */
const INJECTION_PREFIXES = new Set(['=', '+', '-', '@', '\t', '\r']);

/**
 * 셀 값을 CSV-safe 문자열로 변환.
 * - `null`/`undefined`는 빈 문자열
 * - `Date`는 ISO 문자열
 * - 객체는 JSON.stringify
 * - CSV injection prefix는 `'` prepend로 중화
 * - RFC 4180: 구분자/따옴표/개행 포함 시 `"`로 감싸고 내부 `"`는 `""`로 이스케이프
 */
export function escapeCSVField(value: unknown, delimiter: string = ','): string {
  if (value === null || value === undefined) return '';
  let str: string;
  if (value instanceof Date) str = isNaN(value.getTime()) ? '' : value.toISOString();
  else if (typeof value === 'object') {
    try { str = JSON.stringify(value); } catch { str = String(value); }
  } else str = String(value);

  // CSV injection 중화
  if (str.length > 0 && INJECTION_PREFIXES.has(str[0])) {
    str = "'" + str;
  }

  // RFC 4180 quoting
  const needsQuoting =
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r');
  if (needsQuoting) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

export interface ExportCSVOptions<T extends Record<string, any> = Record<string, any>> {
  /** 다운로드 파일명. 기본: 'export.csv' */
  filename?: string;
  /** 필드 구분자. 기본: ',' (탭 구분 원하면 '\t') */
  delimiter?: string;
  /** 행 종결자. 기본: '\r\n' (RFC 4180 준수) */
  eol?: string;
  /** Excel 한글 깨짐 방지용 UTF-8 BOM 포함 여부. 기본: true */
  bom?: boolean;
  /**
   * 선택된 행만 내보내기.
   * 제공 시 `rows` 대신 이 배열이 export 대상이 됩니다.
   */
  checkedRows?: GridRow<T>[];
  /**
   * 셀 값을 최종 CSV 문자열로 직렬화하기 전 변환 훅.
   * 반환값이 곧 셀 값(raw)이며 그 결과에 여전히 `escapeCSVField`가 적용됩니다.
   */
  transformCell?: (value: unknown, row: GridRow<T>, column: Column<T>) => unknown;
}

/**
 * `columns` + `rows`를 CSV 문자열로 직렬화.
 * 파일 다운로드는 수행하지 않고 순수 문자열만 반환합니다 (테스트·서버 응답에 활용).
 */
export function toCSV<T extends Record<string, any> = Record<string, any>>(
  columns: Column<T>[],
  rows: GridRow<T>[],
  opts: Omit<ExportCSVOptions<T>, 'filename' | 'bom'> = {}
): string {
  const delimiter = opts.delimiter ?? ',';
  const eol = opts.eol ?? '\r\n';
  const targetRows = opts.checkedRows ?? rows;

  const header = columns.map(col => escapeCSVField(col.title, delimiter)).join(delimiter);
  const body = targetRows.map(row =>
    columns
      .map(col => {
        const raw = (row as Record<string, unknown>)[col.key];
        const val = opts.transformCell ? opts.transformCell(raw, row, col) : raw;
        return escapeCSVField(val, delimiter);
      })
      .join(delimiter),
  );
  return [header, ...body].join(eol);
}

/**
 * CSV 파일 다운로드를 트리거. 브라우저 환경에서만 동작합니다.
 *
 * @example
 * exportCSV(columns, rows, { filename: 'employees.csv', checkedRows: selected });
 */
export function exportCSV<T extends Record<string, any> = Record<string, any>>(
  columns: Column<T>[],
  rows: GridRow<T>[],
  opts: ExportCSVOptions<T> = {},
): void {
  if (typeof document === 'undefined') return;

  const filename = opts.filename ?? 'export.csv';
  const bom = opts.bom ?? true;
  const csv = toCSV(columns, rows, opts);
  const content = (bom ? '\uFEFF' : '') + csv;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // 메모리 릭 방지
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
