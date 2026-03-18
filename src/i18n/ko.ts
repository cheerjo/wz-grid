// src/i18n/ko.ts
export const ko = {
  toolbar: {
    columnSettings: '컬럼 설정',
    columnVisibility: '컬럼 표시',
    showAll: '전체 표시',
    pinned: '고정',
    expandAll: '모두 펼치기',
    collapseAll: '모두 접기',
    clearFilters: '필터 초기화 ({count})',
    delete: '삭제',
    add: '추가',
  },
  filter: {
    searchPlaceholder: '검색...',
    minPlaceholder: '최소',
    maxPlaceholder: '최대',
    tagSearchPlaceholder: '태그 검색...',
    selectedCount: '{count}개 선택',
    all: '전체',
    selectAll: '전체 선택',
    deselectAll: '전체 해제',
    yes: '예',
    no: '아니요',
    active: '필터 적용 중',
    clear: '필터 초기화',
  },
  grid: {
    subtotal: '소계',
    rowUnit: '건',
  },
  pagination: {
    filteredCount: '{count}건',
    totalCount: '전체 {count}건',
    selected: '{count}건 선택됨',
    pageSize: '페이지 크기:',
  },
  contextMenu: {
    clearCell: '셀 지우기',
    insertAbove: '위에 행 추가',
    insertBelow: '아래에 행 추가',
    deleteRow: '행 삭제',
  },
  validation: {
    required: '{title}은(는) 필수 입력 항목입니다.',
  },
  aria: {
    sortCleared: '정렬이 초기화되었습니다.',
    sortChanged: '정렬: {desc}',
    filterActive: '필터 {count}개 적용 중',
    filterCleared: '필터가 초기화되었습니다.',
    asc: '오름차순',
    desc: '내림차순',
  },
} as const;

export type KoMessages = typeof ko;
