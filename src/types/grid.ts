// src/types/grid.ts
export type ColumnType = 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio' | 'tag' | 'currency' | 'color' | 'email' | 'rating' | 'sparkline' | 'textarea';
export type Align = 'left' | 'center' | 'right';

/**
 * WZGrid에 전달하는 행 데이터 타입.
 * 제네릭 T로 행 데이터 스키마를 지정하면 TypeScript 자동완성을 활용할 수 있습니다.
 *
 * @example
 * // 기본 사용 (기존 코드와 동일)
 * const rows: GridRow[] = [{ id: 1, name: '홍길동' }];
 *
 * // 제네릭 사용 (타입 안전성 강화)
 * interface Employee { name: string; dept: string; salary: number }
 * const rows: GridRow<Employee>[] = [{ id: 1, name: '홍길동', dept: '개발', salary: 5000 }];
 */
export type GridRow<T extends Record<string, any> = Record<string, any>> = { id: string | number } & T;

export type FooterAggr = 'sum' | 'avg' | 'count' | 'min' | 'max' | ((rows: GridRow[]) => any);

/**
 * 컬럼 정의 타입.
 * 제네릭 T(행 데이터 타입)를 지정하면 `key` 속성에서 자동완성을 활용할 수 있습니다.
 *
 * @example
 * // 기본 사용 (기존 코드와 동일)
 * const columns: Column[] = [{ key: 'name', title: '이름' }];
 *
 * // 제네릭 사용 (key 자동완성)
 * interface Employee { name: string; dept: string }
 * const columns: Column<Employee>[] = [{ key: 'name', title: '이름' }]; // key는 'name' | 'dept'만 허용
 */
export type Column<T extends Record<string, any> = Record<string, any>> = {
  key: keyof T & string;
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
  // sparkline 타입 전용
  sparklineType?: 'line' | 'area' | 'bar' | 'column'; // 차트 타입 (기본: 'line')
  sparklineColor?: string;  // 라인/막대 색상 (기본: '#3b82f6')
  sparklineHeight?: number; // SVG 높이 (기본: 32)
}

/** 지원 로케일. 'ko' | 'en' 외 커스텀 문자열도 허용합니다. */
export type Locale = 'ko' | 'en' | (string & {});

/**
 * WZGrid 메시지 오버라이드 타입.
 * 특정 키만 부분적으로 오버라이드할 수 있습니다.
 *
 * @example
 * const messages: Messages = {
 *   toolbar: { add: '+ 새 항목' },
 *   filter: { searchPlaceholder: '이름 입력...' },
 * };
 */
export type Messages = {
  toolbar?: Partial<{
    columnSettings: string; columnVisibility: string; showAll: string; pinned: string;
    expandAll: string; collapseAll: string; clearFilters: string; delete: string; add: string;
  }>;
  filter?: Partial<{
    searchPlaceholder: string; minPlaceholder: string; maxPlaceholder: string;
    tagSearchPlaceholder: string; selectedCount: string; all: string;
    selectAll: string; deselectAll: string; yes: string; no: string; active: string; clear: string;
  }>;
  grid?: Partial<{ subtotal: string; rowUnit: string }>;
  pagination?: Partial<{ filteredCount: string; totalCount: string; selected: string; pageSize: string }>;
  contextMenu?: Partial<{ clearCell: string; insertAbove: string; insertBelow: string; deleteRow: string }>;
  validation?: Partial<{ required: string }>;
  aria?: Partial<{ sortCleared: string; sortChanged: string; filterActive: string; filterCleared: string }>;
};


/**
 * `update:cell` 이벤트 페이로드 타입.
 * WZGrid에서 셀 값이 변경될 때 emit되는 데이터 구조입니다.
 *
 * @example
 * interface Employee { name: string; salary: number }
 * function onCellUpdate(event: CellUpdateEvent<Employee>) {
 *   console.log(event.key);   // 'name' | 'salary'
 *   console.log(event.row);   // GridRow<Employee>
 *   console.log(event.value); // 새 값
 * }
 */
export type CellUpdateEvent<T extends Record<string, any> = Record<string, any>> = {
  row: GridRow<T>;
  key: keyof T & string;
  value: any;
  oldValue: any;
};

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

/**
 * WZGrid의 deprecated prop 목록. 하위 호환을 위해 유지되지만 신규 코드에서는 사용하지 마세요.
 */
export interface WZGridDeprecatedProps {
  /**
   * @deprecated `useColumnSettings`를 사용하세요.
   * 컬럼 표시/숨김 설정 패널 활성화. `useColumnSettings`와 동일하게 동작합니다.
   */
  showColumnSettings?: boolean;

  /**
   * @deprecated `useExcelExport`를 사용하세요.
   * 엑셀 내보내기 버튼 표시. `useExcelExport`와 동일하게 동작합니다.
   */
  showExcelExport?: boolean;

  /**
   * @deprecated `useServerSide`를 사용하세요.
   * 서버 사이드 정렬/페이징 모드 활성화. `useServerSide`와 동일하게 동작합니다.
   */
  serverSide?: boolean;
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

// End of file

