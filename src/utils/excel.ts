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
  // progress 컬럼은 숫자(0~100)로 내보내고, 이후 포맷·conditional formatting을 별도 적용
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
      // progress → 숫자로 출력 (포맷은 아래에서 셀 단위로 적용)
      if (col.type === 'progress') return typeof val === 'number' ? val : Number(val) || 0;

      return val;
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  // 컬럼 너비 자동 설정
  ws['!cols'] = exportCols.map(col => ({
    wch: Math.max(col.title.length + 2, 12),
  }));

  // progress 컬럼 처리
  const dataRowCount = exportRows.length;
  const progressColIndices = exportCols
    .map((col, i) => (col.type === 'progress' ? i : -1))
    .filter(i => i !== -1);

  for (const colIdx of progressColIndices) {
    const colLetter = XLSX.utils.encode_col(colIdx);

    // 각 데이터 셀에 숫자 타입 + 퍼센트 포맷 적용
    for (let r = 1; r <= dataRowCount; r++) {
      const cellAddr = `${colLetter}${r + 1}`; // 1행은 헤더
      const cell = ws[cellAddr];
      if (cell) {
        cell.t = 'n';
        cell.z = '0"%"'; // "75%" 표기 (퍼센트 기호를 리터럴로)
      }
    }

    // Conditional formatting data bar
    // SheetJS Community Edition(>=0.18)에서는 !condfmt 필드를 workbook XML에
    // 직접 삽입하지 않으므로 Excel 파일에서 실제 data bar가 렌더링되지 않을 수 있습니다.
    // xlsx-js-style 또는 SheetJS Pro를 사용하는 환경에서는 동작합니다.
    if (!ws['!condfmt']) ws['!condfmt'] = [];
    (ws['!condfmt'] as any[]).push({
      ref: `${colLetter}2:${colLetter}${dataRowCount + 1}`,
      rules: [
        {
          type: 'dataBar',
          dataBar: {
            minLength: 0,
            maxLength: 100,
            color: { rgb: '638EC6' },
          },
        },
      ],
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
