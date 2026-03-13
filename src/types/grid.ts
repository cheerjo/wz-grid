// src/types/grid.ts
export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio';
export type Align = 'left' | 'center' | 'right';

export interface Column {
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
  truncate?: boolean;  // 내용이 길 때 말줄임표(...) 처리 (기본: true)
  tooltip?: boolean;   // 호버 시 전체 내용을 툴팁으로 표시
}

export interface GridData {
  [key: string]: any;
}

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}
