# WZ-Grid (Vue 2 & 3 Universal Grid)

상용 수준의 고성능 렌더링과 엑셀급 사용자 경험을 제공하는 범용 그리드 컴포넌트입니다.

## 핵심 기능

- **Vue 2 & 3 호환**: `vue-demi`를 사용하여 모든 Vue 환경 지원
- **엑셀 복사/붙여넣기**: Ctrl+C/V를 통한 엑셀과의 완벽한 데이터 연동
- **가상 스크롤**: 10,000개 이상의 대량 데이터도 끊김 없이 렌더링
- **범위 선택**: 마우스 드래그 및 Shift+화살표를 통한 셀 범위 선택
- **다중 정렬**: Shift+클릭으로 여러 컬럼 동시 정렬
- **컬럼 리사이즈**: 헤더 드래그로 컬럼 너비 조절
- **컬럼 순서 변경**: 헤더 드래그 앤 드롭으로 컬럼 순서 재배치
- **행 드래그 재배치**: 행 핸들 드래그로 행 순서 변경 (`useRowDrag`)
- **그룹핑 & 소계**: 특정 컬럼 기준으로 행 그룹화 및 숫자 컬럼 소계 표시 (`groupBy`)
- **셀 병합**: 인접한 동일 값 셀 자동 병합 (`autoMergeCols`, `mergeCells`)
- **컬럼 고정(Pinned)**: 좌측 컬럼 sticky 고정 (`pinned: true`)
- **필터**: 컬럼별 실시간 텍스트 필터 (`useFilter`)
- **컬럼 표시/숨기기**: 헤더 설정 아이콘으로 컬럼 토글 (`showColumnSettings`)
- **페이징**: 페이지 단위 데이터 탐색 (`usePaging`)
- **체크박스**: 행 단위 다중 선택 (`useCheckbox`)
- **컨텍스트 메뉴**: 우클릭 메뉴로 행 추가/삭제 (`useContextMenu`)
- **다양한 셀 타입**: `text`, `number`, `date`, `boolean`, `select`, `badge`, `progress`, `image`, `button`, `link`, `radio`
- **유효성 검사**: 컬럼별 `required`, `validator` 옵션 지원
- **실시간 입력 가공**: 컬럼별 `onInput` 핸들러 지원
- **툴팁**: 셀 내용 호버 시 전체 텍스트 표시 (`tooltip: true`)
- **TypeScript 지원**: 강력한 타입 추론을 통한 안정적인 개발

## 설치 및 사용법

```bash
# 의존성 설치
npm install
# 개발 서버 실행
npm run dev
```

## Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `columns` | `Column[]` | 필수 | 컬럼 정의 배열 |
| `rows` | `any[]` | 필수 | 행 데이터 배열 |
| `height` | `number` | `400` | 그리드 높이(px) |
| `rowHeight` | `number` | `36` | 행 높이(px) |
| `usePaging` | `boolean` | `false` | 페이징 활성화 |
| `pageSize` | `number` | `20` | 페이지당 행 수 |
| `currentPage` | `number` | `1` | 현재 페이지 (v-model) |
| `useCheckbox` | `boolean` | `false` | 체크박스 열 표시 |
| `showAdd` | `boolean` | `false` | 행 추가 버튼 표시 |
| `showDelete` | `boolean` | `false` | 행 삭제 버튼 표시 |
| `useFilter` | `boolean` | `false` | 필터 행 표시 |
| `showColumnSettings` | `boolean` | `false` | 컬럼 표시/숨기기 설정 버튼 |
| `groupBy` | `string` | `''` | 그룹핑 기준 컬럼 key |
| `useContextMenu` | `boolean` | `false` | 우클릭 컨텍스트 메뉴 |
| `useRowDrag` | `boolean` | `false` | 행 드래그 재배치 |
| `autoMergeCols` | `string[]` | `[]` | 자동 셀 병합 적용 컬럼 key 목록 |
| `mergeCells` | `MergeCell[]` | `[]` | 수동 셀 병합 정의 목록 |

## Column 옵션

```typescript
interface Column {
  key: string;            // 데이터 key
  title: string;          // 헤더 표시 텍스트
  width?: number;         // 컬럼 너비(px)
  type?: ColumnType;      // 셀 타입 (기본: 'text')
  align?: Align;          // 본문 정렬 ('left' | 'center' | 'right')
  headerAlign?: Align;    // 헤더 정렬
  options?: { label: string; value?: any; color?: string }[]; // select/badge/radio 옵션
  pinned?: boolean;       // 좌측 고정 컬럼
  required?: boolean;     // 필수값 여부
  validator?: (value: any, row: any) => string | null; // 커스텀 유효성 검사
  onInput?: (value: any) => any; // 실시간 입력 가공
  truncate?: boolean;     // 말줄임표 처리 (기본: true)
  tooltip?: boolean;      // 호버 시 전체 내용 툴팁 표시
}
```

## 이벤트

| 이벤트 | 페이로드 | 설명 |
|--------|---------|------|
| `update:cell` | `{ rowIndex, key, value }` | 셀 값 변경 |
| `update:sort` | `SortConfig[]` | 정렬 변경 |
| `update:resize` | `{ key, width }` | 컬럼 너비 변경 |
| `update:reorder-columns` | `Column[]` | 컬럼 순서 변경 |
| `update:reorder-rows` | `any[]` | 행 순서 변경 (useRowDrag) |
| `update:checked` | `any[]` | 체크된 행 변경 |
| `update:currentPage` | `number` | 현재 페이지 변경 |
| `insert:row` | — | 행 추가 요청 |
| `delete:rows` | `number[]` | 행 삭제 요청 (선택된 행 인덱스) |
| `click:button` | `{ row, key }` | button 타입 셀 클릭 |

## 개발 가이드

- **스타일**: Tailwind CSS 사용
- **컴포저블**: `src/composables/`에서 선택(`useSelection`), 클립보드(`useClipboard`), 가상스크롤(`useVirtualScroll`) 로직 분리
- **타입**: `src/types/grid.ts`에서 공통 타입 정의
- **유틸**: `src/utils/tsv.ts`에서 TSV 파싱/직렬화 처리
