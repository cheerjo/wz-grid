# Composables API

WZ-Grid는 내부적으로 사용하는 컴포저블을 공개 API로 제공합니다. 커스텀 그리드 UI를 구축하거나 그리드 상태를 외부에서 제어할 때 활용할 수 있습니다.

```ts
import {
  useSort, useFilter, useTree, useCheckbox, useValidation,
  useSelection, useClipboard, useVirtualScroll
} from 'wz-grid'
```

---

## useSort

정렬 상태 관리와 클라이언트 사이드 정렬을 제공합니다.

### 시그니처

```ts
function useSort(
  onSort: (configs: SortConfig[]) => void,
  getRows: () => GridRow[],
  isServerSide: () => boolean,
  getColumns?: () => Column[]
): UseSortReturn
```

| 매개변수 | 타입 | 설명 |
| :--- | :--- | :--- |
| `onSort` | `(configs: SortConfig[]) => void` | 정렬 변경 시 호출되는 콜백 (`@sort` 이벤트 트리거용) |
| `getRows` | `() => GridRow[]` | 정렬 대상 rows getter |
| `isServerSide` | `() => boolean` | 서버사이드 모드 여부. `true`이면 정렬을 수행하지 않고 원본 반환 |
| `getColumns` | `() => Column[]` | (선택) 컬럼 타입 인식 정렬(tag, currency)을 위한 컬럼 getter |

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `sortConfigs` | `Ref<SortConfig[]>` | 현재 활성화된 정렬 기준 목록 |
| `sortedRows` | `ComputedRef<GridRow[]>` | 정렬이 적용된 rows |
| `getSortEntry` | `(key: string) => SortConfig \| undefined` | 특정 key의 정렬 항목 반환 |
| `getSortIndex` | `(key: string) => number` | 다중 정렬 시 해당 key의 순서 (없으면 -1) |
| `toggleSort` | `(key: string, e: MouseEvent) => void` | 헤더 클릭으로 정렬 토글. Shift+클릭으로 다중 정렬 추가 |

### 사용 예시

```ts
const { sortedRows, sortConfigs, toggleSort } = useSort(
  (configs) => emit('sort', configs),
  () => props.rows,
  () => props.useServerSide,
  () => props.columns
)
```

---

## useFilter

컬럼별 필터 상태 관리와 필터링 로직을 제공합니다.

### 시그니처

```ts
function useFilter(
  getRows: () => any[],
  getColumns: () => Column[],
  isEnabled: () => boolean
): UseFilterReturn
```

| 매개변수 | 타입 | 설명 |
| :--- | :--- | :--- |
| `getRows` | `() => any[]` | 필터링 대상 rows getter |
| `getColumns` | `() => Column[]` | 컬럼 정의 getter |
| `isEnabled` | `() => boolean` | 필터 활성화 여부. `false`이면 원본 rows 반환 |

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `filters` | `Record<string, any>` | 컬럼별 필터 값 맵 (reactive) |
| `filteredRows` | `ComputedRef<any[]>` | 필터가 적용된 rows |
| `isFilterActive` | `(key: string) => boolean` | 특정 컬럼의 필터 활성 여부 |
| `activeFilterCount` | `ComputedRef<number>` | 현재 활성화된 필터 수 |
| `clearFilter` | `(key: string) => void` | 특정 컬럼 필터 초기화 |
| `clearAllFilters` | `() => void` | 전체 필터 초기화 |

### 컬럼 타입별 필터 구조

| 컬럼 타입 | 필터 구조 |
| :--- | :--- |
| `text`, `email`, `textarea` 등 | `{ value: string }` |
| `number`, `currency`, `rating` | `{ min: string, max: string }` |
| `date`, `datetime` | `{ from: string, to: string }` |
| `select`, `badge` | `{ values: any[], value: string }` |

---

## useTree

트리(계층) 구조의 접기/펼치기 상태를 관리합니다.

### 시그니처

```ts
function useTree(
  getRows: () => any[],
  getEnabled: () => boolean,
  getChildrenKey: () => string,
  getFilteredIds: () => Set<any> | null
): UseTreeReturn
```

| 매개변수 | 타입 | 설명 |
| :--- | :--- | :--- |
| `getRows` | `() => any[]` | 루트 rows getter |
| `getEnabled` | `() => boolean` | 트리 모드 활성 여부 |
| `getChildrenKey` | `() => string` | 자식 배열 필드명 (기본 `'children'`) |
| `getFilteredIds` | `() => Set<any> \| null` | 필터 일치 id Set. `null`이면 필터 없음 |

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `flatTreeItems` | `ComputedRef<DataItem[]>` | 접기/펼치기가 반영된 평탄화 트리 아이템 목록 |
| `toggleNode` | `(id: any) => void` | 특정 노드 접기/펼치기 토글 |
| `isExpanded` | `(id: any) => boolean` | 특정 노드의 펼침 상태 |
| `expandAll` | `() => void` | 전체 펼치기 |
| `collapseAll` | `() => void` | 전체 접기 |

---

## useCheckbox

체크박스 선택 상태를 관리합니다. rows가 교체되면 체크 상태가 자동으로 초기화됩니다.

### 시그니처

```ts
function useCheckbox(
  getFilteredRows: () => any[],
  getAllRows: () => any[],
  onCheckedChange: (checked: any[]) => void
): UseCheckboxReturn
```

| 매개변수 | 타입 | 설명 |
| :--- | :--- | :--- |
| `getFilteredRows` | `() => any[]` | 현재 표시 중인 rows getter (전체 선택의 기준) |
| `getAllRows` | `() => any[]` | 전체 rows getter (체크된 row 객체 추출용) |
| `onCheckedChange` | `(checked: any[]) => void` | 체크 상태 변경 시 호출 (`@check` 이벤트 트리거용) |

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `checkedIds` | `Ref<Set<any>>` | 체크된 row id의 Set |
| `checkedCount` | `ComputedRef<number>` | 체크된 행 수 |
| `isAllChecked` | `ComputedRef<boolean>` | 현재 페이지 전체 체크 여부 |
| `isIndeterminate` | `ComputedRef<boolean>` | 일부만 체크된 중간 상태 |
| `isRowChecked` | `(id: any) => boolean` | 특정 행의 체크 상태 |
| `toggleAll` | `() => void` | 현재 페이지 전체 선택/해제 토글 |
| `toggleRow` | `(id: any) => void` | 특정 행 체크 토글 |

---

## useValidation

`required` 및 커스텀 `validator`가 정의된 컬럼의 셀 값을 검증합니다.

### 시그니처

```ts
function useValidation(
  getRows: () => any[],
  getColumns: () => Column[]
): UseValidationReturn
```

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `errors` | `Record<string, string>` | 셀별 오류 메시지 맵 (reactive). key 형식: `"{rowId}:{columnKey}"` |
| `validateCell` | `(row, col, value) => boolean` | 단일 셀 값 검증. 오류 없으면 `true`, 있으면 `false`를 반환하고 `errors`에 메시지 기록 |

### 사용 예시

```ts
const { errors, validateCell } = useValidation(
  () => props.rows,
  () => props.columns
)

// 특정 셀의 오류 메시지 확인
const errorMsg = errors[`${row.id}:${col.key}`]
```

---

## useSelection

마우스 드래그 기반의 셀 범위 선택 상태를 관리합니다.

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `selection` | `Selection` | 현재 선택 범위 `{ startRow, startCol, endRow, endCol }` |
| `isSelected` | `(row, col) => boolean` | 특정 셀이 선택 범위에 포함되는지 여부 |
| `startSelection` | `(row, col) => void` | 선택 시작 (mousedown) |
| `updateSelection` | `(row, col) => void` | 선택 범위 업데이트 (mousemove) |
| `endSelection` | `() => void` | 선택 종료 (mouseup) |
| `clearSelection` | `() => void` | 선택 초기화 |
| `moveSelection` | `(dir, shift, maxRow, maxCol) => void` | 키보드 화살표로 선택 이동 |

---

## useClipboard

선택 범위의 복사(Ctrl+C)와 붙여넣기(Ctrl+V) 이벤트를 처리합니다.

### 시그니처

```ts
function useClipboard(
  selection: Selection,
  getColumns: () => Column[],
  getRows: () => any[],
  updateCell: (rowIdx: number, colKey: string, value: any) => void
): { onCopy: (e: ClipboardEvent) => void; onPaste: (e: ClipboardEvent) => void }
```

데이터는 TSV(탭 구분 값) 형식으로 클립보드에 저장되어 Excel과 호환됩니다. 편집 중인 `input`/`textarea`/`select`에서의 복사·붙여넣기는 기본 동작에 위임됩니다.

---

## useVirtualScroll

스크롤 위치 기반으로 렌더링할 행 범위를 계산합니다.

### 시그니처

```ts
function useVirtualScroll(
  totalRows: Ref<number>,
  getRowHeight: () => number,
  getViewportHeight: () => number,
  buffer?: number  // 기본값: 5
): UseVirtualScrollReturn
```

### 반환값

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `visibleRange` | `ComputedRef<{ startIdx: number; endIdx: number }>` | 현재 렌더링할 행 인덱스 범위 |
| `topPadding` | `ComputedRef<number>` | 렌더링 영역 위쪽 여백(px) |
| `bottomPadding` | `ComputedRef<number>` | 렌더링 영역 아래쪽 여백(px) |
| `onScroll` | `(e: Event) => void` | 스크롤 이벤트 핸들러 |

> `autoMergeCols` 또는 `mergeCells`가 활성화된 경우 가상 스크롤이 비활성화되어 모든 행을 렌더링합니다.
