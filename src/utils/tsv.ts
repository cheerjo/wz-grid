// src/utils/tsv.ts
export function parseTSV(text: string): string[][] {
  if (!text) return [];
  // 엑셀에서 복사하면 행은 줄바꿈(\r\n 또는 \n), 열은 탭(\t)으로 구분됩니다.
  // trimEnd()로 Excel이 붙이는 후행 \r\n을 제거해 빈 마지막 행이 생기지 않도록 한다.
  return text.trimEnd().split(/\r?\n/).map(row => row.split('\t'));
}

export function stringifyTSV(data: string[][]): string {
  if (!data || data.length === 0) return '';
  return data.map(row => row.join('\t')).join('\n');
}

// RFC 4180: 쉼표, 큰따옴표, 줄바꿈 포함 시 따옴표로 감싸고, 큰따옴표는 ""로 이스케이프
function escapeCSVField(val: any): string {
  const str = val === null || val === undefined ? '' : String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function downloadCSV(data: any[], columns: any[], fileName: string = 'grid-data.csv') {
  const header = columns.map(col => escapeCSVField(col.title)).join(',');
  const rows = data.map(row =>
    columns.map(col => escapeCSVField(row[col.key])).join(',')
  );
  
  const csvContent = "\uFEFF" + [header, ...rows].join('\n'); // Excel 한글 깨짐 방지용 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
