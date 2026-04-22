// packages/core/src/utils/excel.ts
import ExcelJS from 'exceljs';
import type { Column } from '../types/grid';

export interface ExcelExportOptions {
  filename?: string;   // 저장 파일명 (기본: 'export.xlsx')
  sheetName?: string;  // 시트명 (기본: 'Sheet1')
  checkedOnly?: boolean;
  checkedRows?: any[];
}

/**
 * 컬럼 인덱스(0-based)를 Excel 컬럼 문자열(A, B, ..., Z, AA, ...)로 변환
 */
function colIndexToLetter(index: number): string {
  let result = '';
  let n = index + 1;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

/**
 * 그리드 데이터를 Excel(.xlsx) 파일로 내보냅니다.
 *
 * @browserOnly URL.createObjectURL, Blob, document API를 사용합니다.
 *   서버사이드 렌더링(SSR) 환경에서는 동작하지 않습니다.
 *   SSR에서는 `workbook.xlsx.writeBuffer()`를 직접 호출해 Buffer를 응답하세요.
 */
export async function exportExcel(
  columns: Column[],
  rows: any[],
  options: ExcelExportOptions = {}
): Promise<void> {
  const {
    filename  = 'export.xlsx',
    sheetName = 'Sheet1',
    checkedOnly = false,
    checkedRows = [],
  } = options;

  const exportRows = checkedOnly && checkedRows.length > 0 ? checkedRows : rows;

  // 출력 제외 컬럼 (image, button)
  const exportCols = columns.filter(c => c.type !== 'image' && c.type !== 'button');

  // 데이터 행 (타입별 값 변환)
  const data = exportRows.map(row => {
    const rowData: Record<string, any> = {};
    for (const col of exportCols) {
      const val = row[col.key];
      if (val === null || val === undefined) {
        rowData[col.key] = '';
        continue;
      }

      // select / badge / radio → label로 변환
      if ((col.type === 'select' || col.type === 'badge' || col.type === 'radio') && col.options) {
        rowData[col.key] = col.options.find(o => o.value === val)?.label ?? val;
        continue;
      }
      // boolean → ✓ / ✗
      if (col.type === 'boolean') {
        rowData[col.key] = val ? '✓' : '✗';
        continue;
      }
      // progress → 숫자 (0~100)
      if (col.type === 'progress') {
        rowData[col.key] = typeof val === 'number' ? val : Number(val) || 0;
        continue;
      }

      rowData[col.key] = val;
    }
    return rowData;
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 컬럼 정의 (헤더 + key + 너비)
  worksheet.columns = exportCols.map(col => ({
    header: col.title,
    key: col.key,
    width: Math.max(col.title.length + 2, 12),
  }));

  // 데이터 행 추가
  worksheet.addRows(data);

  const dataRowCount = exportRows.length;

  // progress 컬럼 처리: 셀 포맷 + Data Bar 조건부 서식
  exportCols.forEach((col, colIdx) => {
    if (col.type !== 'progress') return;

    const colLetter = colIndexToLetter(colIdx);

    // 각 데이터 셀에 숫자 포맷 0"%" 적용 (2행부터 시작, 1행은 헤더)
    for (let r = 2; r <= dataRowCount + 1; r++) {
      const cell = worksheet.getCell(`${colLetter}${r}`);
      cell.numFmt = '0"%"';
    }

    // Data Bar 조건부 서식
    // cfvo 배열은 필수 (없으면 writeBuffer 시 forEach TypeError 발생)
    // type: 'num' + value로 0~100 고정 범위 지정
    worksheet.addConditionalFormatting({
      ref: `${colLetter}2:${colLetter}${dataRowCount + 1}`,
      rules: [
        {
          type: 'dataBar',
          cfvo: [
            { type: 'num', value: 0 },
            { type: 'num', value: 100 },
          ],
          color: { argb: 'FF638EC6' },
        } as any,
      ],
    });
  });

  // [브라우저 전용] Blob + URL.createObjectURL + <a> 클릭으로 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // setTimeout으로 다운로드 시작 후 URL 해제 (즉시 해제 시 일부 브라우저에서 다운로드 취소됨)
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
