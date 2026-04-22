// packages/core/src/utils/print.ts
import { Column } from '../types/grid';

// 출력 제외 타입 (image, button은 텍스트로 표현하기 어려우므로 제외)
const SKIP_TYPES = new Set(['image', 'button', 'sparkline', 'action']);

function getCellText(col: Column, row: any): string {
  const val = row[col.key];

  if (val === null || val === undefined) return '';

  switch (col.type) {
    case 'boolean':
      return val ? '✓ (Y)' : '✗ (N)';
    case 'number':
      return Number(val).toLocaleString();
    case 'currency': {
      const sym = col.currencySymbol || '₩';
      const formatted = Number(val).toLocaleString(undefined, {
        minimumFractionDigits: col.decimals || 0,
        maximumFractionDigits: col.decimals || 0,
      });
      return `${sym}${formatted}`;
    }
    case 'progress':
      return `${val}%`;
    case 'select':
    case 'badge':
    case 'radio':
      return col.options?.find(o => o.value === val)?.label ?? String(val);
    case 'tag':
      return Array.isArray(val) ? val.join(', ') : String(val);
    case 'date':
    case 'datetime':
      return String(val).replace('T', ' ');
    default:
      return String(val);
  }
}

/**
 * 그리드 데이터를 새 창에서 인쇄합니다.
 *
 * @browserOnly window.open, document.write API를 사용합니다.
 *   서버사이드 렌더링(SSR) 환경에서는 동작하지 않습니다.
 *   SSR에서는 generatePrintHTML()로 HTML 문자열만 생성하세요 (향후 분리 예정).
 */
export function printGrid(
  columns: Column[],
  rows: any[],
  options: { title?: string; printCheckedOnly?: boolean; checkedRows?: any[]; logoUrl?: string } = {}
) {
  const { title = '그리드 출력 데이터', printCheckedOnly = false, checkedRows = [], logoUrl } = options;

  const printRows = printCheckedOnly && checkedRows.length > 0 ? checkedRows : rows;
  const printCols = columns.filter(col => !SKIP_TYPES.has(col.type ?? '') && col.key !== 'action');

  // 전체 너비 계산 (비율 설정을 위해)
  const totalWidth = printCols.reduce((sum, col) => sum + (col.width || 100), 0);

  const thead = printCols
    .map(col => {
      const widthPct = ((col.width || 100) / totalWidth * 100).toFixed(2);
      return `<th style="width: ${widthPct}%;">${col.title}${col.required ? ' *' : ''}</th>`;
    })
    .join('');

  const tbody = printRows
    .map(row => {
      const cells = printCols
        .map(col => `<td class="${col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left'}">${getCellText(col, row)}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const subtitle = printCheckedOnly && checkedRows.length > 0
    ? `출력 대상: 선택 ${checkedRows.length.toLocaleString()}건 / 전체 ${rows.length.toLocaleString()}건`
    : `출력 대상: 전체 ${rows.length.toLocaleString()}건`;

  // 컬럼이 많으면 가로(landscape), 적으면 세로(portrait)
  const pageOrientation = printCols.length > 6 ? 'landscape' : 'portrait';

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    /* 기본 리셋 및 폰트 */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Pretendard', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
      font-size: 11px;
      color: #333;
      padding: 24px;
      line-height: 1.4;
    }

    /* 헤더 영역 */
    .print-header {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #111;
      padding-bottom: 8px;
    }
    .print-header-left h1 { font-size: 22px; font-weight: 800; color: #111; margin-bottom: 6px; }
    .print-header-left p  { font-size: 12px; color: #666; }
    .print-logo { max-height: 40px; }

    /* 테이블 스타일 */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 6px;
      word-break: break-all;
      vertical-align: middle;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
      color: #111;
    }
    td.center { text-align: center; }
    td.right  { text-align: right; }
    td.left   { text-align: left; }
    tr:nth-child(even) td { background-color: #fafbfc; }

    /* --- 프린트 최적화 미디어 쿼리 --- */
    @media print {
      @page {
        margin: 1.5cm;
        size: A4 ${pageOrientation}; /* 컬럼 수에 따라 자동 가로/세로 전환 */
      }
      body { padding: 0; }

      /* 배경색과 테두리가 인쇄되도록 강제 설정 */
      th, tr:nth-child(even) td {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* 줄임말 처리 방지 및 테이블 행이 페이지 중간에 잘리지 않도록 보호 */
      tr { page-break-inside: avoid; }
      td, th { page-break-inside: avoid; }

      /* 인쇄 시 불필요한 테두리나 그림자 제거 */
      table { border: 1px solid #999; }
      th, td { border: 1px solid #ccc; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-header-left">
      <h1>${title}</h1>
      <p>출력일시: ${new Date().toLocaleString('ko-KR')} &nbsp;|&nbsp; ${subtitle}</p>
    </div>
    ${logoUrl ? `<img src="${logoUrl}" class="print-logo" alt="Logo" />` : ''}
  </div>
  <table>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
  <script>
    window.onload = function() {
      // 렌더링 직후 약간의 지연 시간을 주어 정상적으로 인쇄창 띄우기
      setTimeout(function() { window.print(); }, 200);
    };
  </script>
</body>
</html>`;

  // [브라우저 전용] window.open + document.write로 인쇄 창 열기
  const win = window.open('', '_blank');
  if (!win) {
    alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
