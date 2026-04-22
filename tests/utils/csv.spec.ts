import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { escapeCSVField, toCSV, exportCSV } from '@wezon/wz-grid-core';
import type { Column, GridRow } from '@wezon/wz-grid-core';

describe('escapeCSVField', () => {
  it('null / undefined → 빈 문자열', () => {
    expect(escapeCSVField(null)).toBe('');
    expect(escapeCSVField(undefined)).toBe('');
  });

  it('일반 텍스트는 그대로 반환', () => {
    expect(escapeCSVField('hello')).toBe('hello');
    expect(escapeCSVField(123)).toBe('123');
  });

  it('RFC 4180: 구분자 포함 시 따옴표로 감쌈', () => {
    expect(escapeCSVField('a,b')).toBe('"a,b"');
  });

  it('RFC 4180: 따옴표는 ""로 이스케이프', () => {
    expect(escapeCSVField('say "hi"')).toBe('"say ""hi"""');
  });

  it('RFC 4180: 개행 포함 시 따옴표로 감쌈', () => {
    expect(escapeCSVField('line1\nline2')).toBe('"line1\nline2"');
  });

  it('CSV injection: = + - @ 로 시작하면 \' 접두', () => {
    expect(escapeCSVField('=A1+B1')).toBe("'=A1+B1");
    expect(escapeCSVField('+1234')).toBe("'+1234");
    expect(escapeCSVField('-neg')).toBe("'-neg");
    expect(escapeCSVField('@DDE')).toBe("'@DDE");
    // 내부에 `(` `)` 가 있어도 RFC 4180 quoting 대상 아님
    expect(escapeCSVField('-SUM(A1)')).toBe("'-SUM(A1)");
  });

  it('CSV injection: \\t 또는 \\r 로 시작하면 \' 접두', () => {
    // \t 는 RFC 4180 quoting 대상 아님 → 접두만 붙음
    expect(escapeCSVField('\tevil')).toBe("'\tevil");
    // \r 은 RFC 4180 quoting 대상 → 접두 + 따옴표 감쌈
    expect(escapeCSVField('\revil')).toBe('"\'\revil"');
  });

  it('injection 중화 후에도 RFC 4180 quoting 병행', () => {
    // `=a,b`는 injection 중화 후 `'=a,b` → 내부에 구분자가 있으므로 따옴표 감싸기.
    expect(escapeCSVField('=a,b')).toBe('"\'=a,b"');
  });

  it('Date → ISO 문자열', () => {
    const d = new Date('2026-04-17T00:00:00.000Z');
    expect(escapeCSVField(d)).toBe('2026-04-17T00:00:00.000Z');
  });

  it('객체 → JSON.stringify (따옴표 포함으로 quoting)', () => {
    expect(escapeCSVField({ a: 1 })).toBe('"{""a"":1}"');
  });

  it('커스텀 구분자(탭) 사용 시 ,는 quoting 대상 아님', () => {
    expect(escapeCSVField('a,b', '\t')).toBe('a,b');
    expect(escapeCSVField('a\tb', '\t')).toBe('"a\tb"');
  });
});

describe('toCSV', () => {
  interface Row { name: string; age: number; formula: string }
  const columns: Column<Row>[] = [
    { key: 'name', title: '이름' },
    { key: 'age', title: '나이' },
    { key: 'formula', title: '공식' },
  ];
  const rows: GridRow<Row>[] = [
    { id: 1, name: '홍길동', age: 30, formula: '=SUM(A1:A5)' },
    { id: 2, name: 'Jane, Doe', age: 25, formula: '+1+1' },
  ];

  it('헤더 + 본문 생성', () => {
    const csv = toCSV(columns, rows);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('이름,나이,공식');
    expect(lines.length).toBe(3);
  });

  it('CSV injection이 모든 행에서 중화됨', () => {
    const csv = toCSV(columns, rows);
    expect(csv).toContain("'=SUM");
    expect(csv).toContain("'+1+1");
  });

  it('구분자를 포함한 값은 따옴표로 감쌈', () => {
    const csv = toCSV(columns, rows);
    expect(csv).toContain('"Jane, Doe"');
  });

  it('checkedRows 옵션 시 그 배열만 내보냄', () => {
    const csv = toCSV(columns, rows, { checkedRows: [rows[0]] });
    expect(csv.split('\r\n').length).toBe(2); // header + 1
    expect(csv).toContain('홍길동');
    expect(csv).not.toContain('Jane');
  });

  it('transformCell 훅으로 값 가공', () => {
    const csv = toCSV(columns, rows, {
      transformCell: (v, _r, c) => (c.key === 'age' ? `${v}세` : v),
    });
    expect(csv).toContain('30세');
  });

  it('eol 커스터마이즈', () => {
    const csv = toCSV(columns, rows, { eol: '\n' });
    expect(csv).not.toContain('\r\n');
    expect(csv.split('\n').length).toBe(3);
  });
});

describe('exportCSV', () => {
  const columns: Column[] = [{ key: 'name', title: '이름' }];
  const rows: GridRow[] = [{ id: 1, name: '테스트' }];

  let clicked = false;
  let lastDownload = '';
  let lastHref = '';

  beforeEach(() => {
    clicked = false;
    lastDownload = '';
    lastHref = '';
    // URL.createObjectURL / revokeObjectURL: jsdom에는 없음
    (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock');
    (globalThis as any).URL.revokeObjectURL = vi.fn();
    // a 요소 click을 가로채서 호출 여부 기록
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(() => {
          clicked = true;
          lastDownload = (el as HTMLAnchorElement).download;
          lastHref = (el as HTMLAnchorElement).href;
        });
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('download attribute와 href가 세팅되고 click 트리거됨', () => {
    exportCSV(columns, rows, { filename: 'foo.csv' });
    expect(clicked).toBe(true);
    expect(lastDownload).toBe('foo.csv');
    expect(lastHref).toContain('blob:');
  });

  it('filename 미지정 시 기본값 export.csv', () => {
    exportCSV(columns, rows);
    expect(lastDownload).toBe('export.csv');
  });
});
