// packages/react/src/utils/export.ts
// Core exportExcel / exportCSV 래퍼 — React에서 직접 호출 가능한 유틸 함수
import { exportExcel as coreExportExcel, exportCSV as coreExportCSV } from '@wezon/wz-grid-core';
import type { Column, GridRow, ExcelExportOptions, ExportCSVOptions } from '@wezon/wz-grid-core';

/**
 * 그리드 데이터를 Excel 파일로 내보내기.
 *
 * @example
 * import { exportToExcel } from '@wezon/wz-grid-react/utils/export';
 * await exportToExcel(columns, rows, { filename: 'employees.xlsx' });
 */
export async function exportToExcel(
  columns: Column[],
  rows: GridRow[],
  options: ExcelExportOptions = {}
): Promise<void> {
  return coreExportExcel(columns, rows, options);
}

/**
 * 그리드 데이터를 CSV 파일로 내보내기.
 *
 * @example
 * import { exportToCsv } from '@wezon/wz-grid-react/utils/export';
 * exportToCsv(columns, rows, { filename: 'employees.csv' });
 */
export function exportToCsv(
  columns: Column[],
  rows: GridRow[],
  options: ExportCSVOptions = {}
): void {
  return coreExportCSV(columns, rows, options);
}
