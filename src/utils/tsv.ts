// src/utils/tsv.ts
export function parseTSV(text: string): string[][] {
  if (!text) return [];
  // 엑셀에서 복사하면 행은 줄바꿈(\r\n 또는 \n), 열은 탭(\t)으로 구분됩니다.
  return text.split(/\r?\n/).map(row => row.split('\t'));
}

export function stringifyTSV(data: string[][]): string {
  if (!data || data.length === 0) return '';
  return data.map(row => row.join('\t')).join('\n');
}

export function downloadCSV(data: any[], columns: any[], fileName: string = 'grid-data.csv') {
  const header = columns.map(col => col.title).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const val = row[col.key] || '';
      // 쉼표가 포함된 경우 따옴표로 감싸기
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',')
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
