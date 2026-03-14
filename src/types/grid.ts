// src/types/grid.ts
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio';
export type Align = 'left' | 'center' | 'right';
export type FooterAggr = 'sum' | 'avg' | 'count' | 'min' | 'max' | ((rows: any[]) => any);

export type Column = {
  key: string;
  title: string;
  width?: number;
  type?: ColumnType;
  align?: Align;       // 본문 데이터 정렬
  headerAlign?: Align; // 헤더 텍스트 정렬 (미지정 시 align 또는 left 사용)
  options?: { label: string; value?: any; color?: string }[]; // value는 button 타입처럼 불필요한 경우를 위해 optional로 선언
  pinned?: boolean;    // true이면 해당 컬럼을 좌측에 고정(sticky)
  required?: boolean;  // 필수값 여부
  validator?: (value: any, row: any) => string | null; // 커스텀 유효성 검사 함수
  onInput?: (value: any) => any; // 실시간 입력 가공 함수
  truncate?: boolean;   // 내용이 길 때 말줄임표(...) 처리 (기본: true)
  tooltip?: boolean;    // 호버 시 전체 내용을 툴팁으로 표시
  footer?: FooterAggr;  // 푸터 집계 방식
  footerLabel?: string; // 집계 값 앞에 표시할 레이블 (예: '합계')
}

export type SortConfig = {
  key: string;
  order: 'asc' | 'desc';
};

export interface GridData {
  [key: string]: any;
}

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

// 그룹핑/가상 스크롤에서 사용하는 행 아이템 타입
export type DataItem = {
  type: 'data';
  row: any;
  level?: number;
  hasChildren?: boolean;
};
export type GroupHeader = {
  type: 'group-header';
  key: string;
  label: string;
  count: number;
  collapsed: boolean;
};
export type SubtotalItem = { type: 'subtotal'; key: string; count: number; sums: Record<string, number> };
export type GridItem = DataItem | GroupHeader | SubtotalItem;

export type MergeState = { rowspan: number; colspan: number; hidden: boolean };
