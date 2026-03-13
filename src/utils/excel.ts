// src/utils/excel.ts
import * as XLSX from 'xlsx';
import type { Column } from '../types/grid';

export interface ExcelExportOptions {
  filename?: string;   // 저장 파일명 (기본: 'export.xlsx')
  sheetName?: string;  // 시트명 (기본: 'Sheet1')
  checkedOnly?: boolean;
  checkedRows?: any[];
}

/**
 * 그리드 데이터를 Excel(.xlsx) 파일로 내보냅니다.
 * Pro 라이선스 전용 기능입니다.
 */
export function exportExcel(
  columns: Column[],
  rows: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    filename  = 'export.xlsx',
    sheetName = 'Sheet1',
    checkedOnly = false,
    checkedRows = [],
  } = options;

  const exportRows = checkedOnly && checkedRows.length > 0 ? checkedRows : rows;

  // 출력 제외 컬럼 (image, button)
  const exportCols = columns.filter(c => c.type !== 'image' && c.type !== 'button');

  // 헤더 행
  const header = exportCols.map(c => c.title);

  // 데이터 행
  const data = exportRows.map(row =>
    exportCols.map(col => {
      const val = row[col.key];
      if (val === null || val === undefined) return '';

      // select / badge / radio → label로 변환
      if ((col.type === 'select' || col.type === 'badge' || col.type === 'radio') && col.options) {
        return col.options.find(o => o.value === val)?.label ?? val;
      }
      // boolean → ✓ / ✗
      if (col.type === 'boolean') return val ? '✓' : '✗';
      // progress → N%
      if (col.type === 'progress') return `${val}%`;

      return val;
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  // 컬럼 너비 자동 설정
  ws['!cols'] = exportCols.map(col => ({
    wch: Math.max(col.title.length + 2, 12),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
