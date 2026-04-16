// src/types/grid.ts
export type ColumnType = 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'badge' | 'progress' | 'image' | 'button' | 'link' | 'radio' | 'tag' | 'currency' | 'color' | 'email' | 'rating' | 'sparkline' | 'textarea';
export type Align = 'left' | 'center' | 'right';

/** 텍스트 편집이 불가능한 컬럼 타입 (클릭 토글 + 읽기 전용) */
export const NON_EDITABLE_TYPES: ReadonlySet<string> = new Set([
  'boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio', 'rating', 'color', 'tag', 'sparkline'
]);

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

/**
 * 푸터 집계 방식.
 * 제네릭 T로 행 타입을 지정하면 커스텀 집계 함수(`rows => any`)의 인자 타입을 강화할 수 있습니다.
 *
 * @example
 * interface Employee { salary: number }
 * const col: Column<Employee> = {
 *   key: 'salary',
 *   title: '급여',
 *   footer: (rows) => rows.reduce((s, r) => s + r.salary, 0) / rows.length, // rows: GridRow<Employee>[]
 * };
 */
export type FooterAggr<T extends Record<string, any> = Record<string, any>> =
  | 'sum' | 'avg' | 'count' | 'min' | 'max'
  | ((rows: GridRow<T>[]) => any);

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
/**
 * 컬럼에서 "현재 컬럼의 셀 값" 타입.
 * 제네릭 T가 주어지면 T의 string 키들이 가지는 값의 union 타입이 됩니다.
 * T가 기본값(`Record<string, any>`)이면 `any`로 동작해 하위 호환됩니다.
 */
export type ColumnCellValue<T extends Record<string, any> = Record<string, any>> =
  keyof T & string extends never ? any : T[keyof T & string];

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
  /**
   * 커스텀 유효성 검사 함수.
   * 제네릭 T가 주어지면 `value`는 T의 셀 값 union, `row`는 `GridRow<T>`로 타입이 강화됩니다.
   */
  validator?: (value: ColumnCellValue<T>, row: GridRow<T>) => string | null;
  /**
   * 실시간 입력 가공 함수. 반환값으로 편집 중인 `value`를 덮어씁니다.
   */
  onInput?: (value: ColumnCellValue<T>) => ColumnCellValue<T>;
  editable?: boolean;   // 직접 편집 가능 여부 (기본: 컬럼 타입 기본 규칙 사용)
  rules?: any[];        // 외부 폼 컴포넌트 등과의 연동을 위한 검증 룰 배열
  truncate?: boolean;   // 내용이 길 때 말줄임표(...) 처리 (기본: true)
  tooltip?: boolean;    // 호버 시 전체 내용을 툴팁으로 표시
  /** 푸터 집계 방식 (제네릭 T 전파) */
  footer?: FooterAggr<T>;
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
    /** CSV 내보내기 버튼 aria-label */
    csvExport: string;
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
  aria?: Partial<{
    sortCleared: string; sortChanged: string; filterActive: string; filterCleared: string;
    /** 행 체크박스 라벨 */
    selectRow: string;
    /** 헤더 전체 선택 체크박스 라벨 */
    selectAll: string;
    /** 행 드래그 핸들 라벨 */
    rowDragHandle: string;
    /** 트리 노드 펼침/접기 버튼 라벨 */
    toggleExpand: string;
    /** 상세 행 토글 버튼 라벨 */
    toggleDetail: string;
    /** 로딩 상태 안내 */
    loading: string;
    /** 빈 상태 안내 */
    empty: string;
  }>;
  /** 빈/로딩 상태 텍스트 */
  state?: Partial<{ empty: string; loading: string }>;
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
  /** 변경된 새 값. 제네릭 T가 주어지면 T의 셀 값 union 타입. */
  value: ColumnCellValue<T>;
  /** 변경 전 값. 제네릭 T가 주어지면 T의 셀 값 union 타입. */
  oldValue: ColumnCellValue<T>;
};

export type SortConfig = {
  key: string;
  order: 'asc' | 'desc';
};

/**
 * `sort` 이벤트 페이로드 타입.
 * 정렬이 변경될 때 emit되는 데이터 구조입니다.
 *
 * @example
 * function onSort(event: SortChangeEvent) {
 *   console.log(event.configs);  // [{ key: 'name', order: 'asc' }]
 * }
 */
export type SortChangeEvent = {
  /** 현재 활성 정렬 설정 (배열 — 다중 정렬 지원 대비) */
  configs: SortConfig[];
};

/**
 * `update:filters` 이벤트 페이로드 타입.
 * serverSide 모드에서 필터가 변경될 때 emit됩니다.
 */
export type FilterChangeEvent = {
  /** 컬럼 키 → 필터 값 맵 (활성 필터만 포함) */
  filters: Record<string, any>;
  /** 활성 필터 개수 */
  activeCount: number;
};

/**
 * 셀 선택 범위 이벤트 페이로드.
 */
export type SelectionChangeEvent = {
  /** 현재 선택 범위. null이면 선택 해제 */
  selection: Selection | null;
};

/**
 * 페이징 변경 이벤트 페이로드.
 */
export type PagingChangeEvent = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
};

/**
 * 체크박스(행 선택) 변경 이벤트 페이로드.
 */
export type CheckedChangeEvent = {
  /** 체크된 행 id 배열 */
  checked: (string | number)[];
};

/**
 * 셀 슬롯(`#cell-{key}`)에 전달되는 props 타입.
 * 사용자 정의 셀 템플릿을 작성할 때 이 타입으로 slot props를 단언하면 자동완성을 얻을 수 있습니다.
 */
export type CellSlotProps<T extends Record<string, any> = Record<string, any>> = {
  row: GridRow<T>;
  column: Column<T>;
  /** 현재 셀 값. 제네릭 T가 주어지면 T의 셀 값 union 타입. */
  value: ColumnCellValue<T>;
  rowIndex: number;
};

/**
 * 상세 행 슬롯(`#detail`)에 전달되는 props 타입.
 */
export type DetailSlotProps<T extends Record<string, any> = Record<string, any>> = {
  row: GridRow<T>;
  rowIndex: number;
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
/**
 * 데이터 행 아이템. 제네릭 T로 `row`의 스키마를 지정할 수 있습니다.
 */
export type DataItem<T extends Record<string, any> = Record<string, any>> = {
  type: 'data';
  row: GridRow<T>;
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
/**
 * 가상 스크롤/페이징에서 렌더링되는 행 단위 유니온.
 * 제네릭 T는 `DataItem.row`에 전파됩니다.
 */
export type GridItem<T extends Record<string, any> = Record<string, any>> =
  | DataItem<T> | GroupHeader | SubtotalItem;

export type MergeState = { rowspan: number; colspan: number; hidden: boolean };

// End of file

