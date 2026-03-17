// src/types/grid.ts
export type ColumnType = 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio' | 'tag' | 'currency' | 'color' | 'email' | 'rating' | 'sparkline' | 'textarea';
export type Align = 'left' | 'center' | 'right';

/**
 * WZGrid에 전달하는 행 데이터의 기본 인터페이스.
 * id 필드는 체크박스, 트리, 편집, 병합 등 내부 식별자로 필수 사용됩니다.
 */
export interface GridRow {
  id: string | number;
  [key: string]: any;
}

export type FooterAggr = 'sum' | 'avg' | 'count' | 'min' | 'max' | ((rows: GridRow[]) => any);

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
  // currency 타입 전용
  currencySymbol?: string; // 통화 기호 (기본값: '₩')
  decimals?: number;       // 소수점 자리수 (기본값: 0)
  // rating 타입 전용
  maxRating?: number;   // 최대 별점 (기본: 5)
  // sparkline 타입 전용 (Pro)
  sparklineColor?: string;  // 라인 색상 (기본: '#3b82f6')
  sparklineHeight?: number; // SVG 높이 (기본: 32)
}

export type SortConfig = {
  key: string;
  order: 'asc' | 'desc';
};

/** @deprecated GridRow를 사용하세요 */
export type GridData = GridRow;

/**
 * WZGrid props 네이밍 가이드
 *
 * 기능 활성화 props는 `use` 접두어로 통일하는 것을 권장합니다.
 * 하위 호환을 위해 기존 이름도 계속 동작하지만, 신규 코드에서는 아래 권장 이름을 사용하세요.
 *
 * | 기존 이름 (deprecated)    | 권장 이름 (alias)      |
 * |:--------------------------|:-----------------------|
 * | `showColumnSettings`      | `useColumnSettings`    |
 * | `showExcelExport`         | `useExcelExport`       |
 * | `serverSide`              | `useServerSide`        |
 *
 * 참고: `showAdd`, `showDelete`, `showFooter`는 "표시 여부"가 명확한 의미라
 * 변경 없이 유지됩니다.
 */
export type _WZGridPropNamingGuide = never;

export interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

// 그룹핑/가상 스크롤에서 사용하는 행 아이템 타입
export type DataItem = {
  type: 'data';
  row: GridRow;
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
