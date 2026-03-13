// src/utils/print.ts
import { Column } from '../types/grid';

// 출력 제외 타입 (image, button은 의미 없음)
const SKIP_TYPES = new Set(['image', 'button']);

function getCellText(col: Column, row: any): string {
  const val = row[col.key];

  if (val === null || val === undefined) return '';

  switch (col.type) {
    case 'boolean':
      return val ? '✓' : '✗';

    case 'number':
      return Number(val).toLocaleString();

    case 'progress':
      return `${val}%`;

    case 'select':
    case 'badge':
    case 'radio':
      return col.options?.find(o => o.value === val)?.label ?? String(val);

    default:
      return String(val);
  }
}

export function printGrid(
  columns: Column[],
  rows: any[],
  options: { title?: string; printCheckedOnly?: boolean; checkedRows?: any[] } = {}
) {
  const { title = '그리드 출력', printCheckedOnly = false, checkedRows = [] } = options;

  const printRows = printCheckedOnly && checkedRows.length > 0 ? checkedRows : rows;
  const printCols = columns.filter(col => !SKIP_TYPES.has(col.type ?? ''));

  const thead = printCols
    .map(col => `<th>${col.title}${col.required ? ' *' : ''}</th>`)
    .join('');

  const tbody = printRows
    .map(row => {
      const cells = printCols
        .map(col => `<td class="${col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : ''}">${getCellText(col, row)}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const subtitle = printCheckedOnly && checkedRows.length > 0
    ? `선택 ${checkedRows.length.toLocaleString()}건 / 전체 ${rows.length.toLocaleString()}건`
    : `전체 ${rows.length.toLocaleString()}건`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif;
      font-size: 11px;
      color: #111;
      padding: 16px;
    }
    .print-header { margin-bottom: 12px; }
    .print-header h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
    .print-header p  { font-size: 11px; color: #555; }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 5px 7px;
      word-break: break-all;
      vertical-align: middle;
    }
    th {
      background: #f3f4f6;
      font-weight: bold;
      text-align: center;
      white-space: nowrap;
    }
    td.center { text-align: center; }
    td.right  { text-align: right; }
    tr:nth-child(even) td { background: #f9fafb; }
    @media print {
      @page { margin: 1.2cm; size: A4 landscape; }
      body  { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>${title}</h1>
    <p>${new Date().toLocaleString('ko-KR')} &nbsp;·&nbsp; ${subtitle}</p>
  </div>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1000,height=700');
  if (!win) { alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.'); return; }
  win.document.write(html);
  win.document.close();
}
