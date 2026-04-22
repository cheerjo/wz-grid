// packages/core/src/utils/tsv.ts
import { exportCSV as _exportCSV } from './csv';
import type { Column, GridRow } from '../types/grid';

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

/**
 * @deprecated `exportCSV`(from `@wezon/wz-grid-core`)를 사용하세요.
 * 하위 호환을 위해 유지되며 내부적으로 `exportCSV`에 위임합니다.
 * 신규 구현은 CSV injection 가드와 RFC 4180 준수가 강화되었습니다.
 */
export function downloadCSV(
  data: GridRow[],
  columns: Column[],
  fileName: string = 'grid-data.csv',
): void {
  _exportCSV(columns, data, { filename: fileName });
}
