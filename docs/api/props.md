# Props

## 필수 Props

| Prop | 타입 | 설명 |
| :--- | :--- | :--- |
| `columns` | `Column[]` | 컬럼 정의 배열 |
| `rows` | `any[]` | 행 데이터 배열. 각 객체는 `id` 필드 필요 |

## Props

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `height` | `number` | `500` | 그리드 전체 높이(px) |
| `rowHeight` | `number` | `40` | 각 행의 높이(px). 가상 스크롤 계산에 사용 |
| `usePaging` | `boolean` | `false` | 페이징 활성화 여부 |
| `pageSize` | `number` | `20` | 페이지당 표시 행 수 (`v-model:pageSize` 지원) |
| `currentPage` | `number` | `1` | 현재 페이지 번호 (`v-model:currentPage` 지원) |
| `useCheckbox` | `boolean` | `false` | 첫 번째 컬럼에 체크박스 활성화 |
| `showAdd` | `boolean` | `false` | 툴바에 추가 버튼 표시 |
| `showDelete` | `boolean` | `false` | 툴바에 삭제 버튼 표시 |
| `useFilter` | `boolean` | `false` | 컬럼별 필터 입력 행 표시 |
| `showFooter` | `boolean` | `false` | 하단 집계 행 표시. 컬럼 `footer` 속성으로 집계 방식 지정 |
| `useTree` | `boolean` | `false` | 트리(계층) 구조 모드. `rows`에 `children` 배열을 중첩해 사용 |
| `treeKey` | `string` | `''` | 트리 인덴트·토글을 표시할 컬럼 key. 미지정 시 첫 번째 컬럼 |
| `childrenKey` | `string` | `'children'` | 자식 행 배열 필드명 |
| `rowClass` | `(row, rowIndex) => any` | `null` | 행에 동적 CSS 클래스를 적용하는 함수 |
| `cellClass` | `(row, column, rowIndex) => any` | `null` | 셀에 동적 CSS 클래스를 적용하는 함수 |
| `showColumnSettings` ⚠️ | `boolean` | `false` | 컬럼 표시/숨기기 설정 버튼 표시. `useColumnSettings` 사용 권장 |
| `useColumnSettings` | `boolean` | `false` | 컬럼 표시/숨기기 설정 버튼 표시 (`showColumnSettings`의 권장 alias) |
| `useContextMenu` | `boolean` | `false` | 우클릭 컨텍스트 메뉴 사용 |
| `useRowDrag` | `boolean` | `false` | 행 드래그 재배치 활성화 |
| `groupBy` | `string` | `''` | 그룹핑 기준 컬럼 key |
| `autoMergeCols` | `string[]` | `[]` | 인접한 동일 값 셀을 자동 병합할 컬럼 key 목록 |
| `mergeCells` | `(row, colKey) => \{ rowspan?, colspan? \} \| null` | `null` | 셀별 병합 규칙을 반환하는 함수. 병합하지 않을 경우 `null` 반환 |
| `showExcelExport` ⚠️ | `boolean` | `false` | 툴바에 Excel 내보내기 버튼 표시. `useExcelExport` 사용 권장 |
| `useExcelExport` | `boolean` | `false` | 툴바에 Excel 내보내기 버튼 표시 (`showExcelExport`의 권장 alias) |
| `excelFilename` | `string` | `'export.xlsx'` | Excel 저장 파일명 |
| `serverSide` ⚠️ | `boolean` | `false` | 서버사이드 모드. `useServerSide` 사용 권장 |
| `useServerSide` | `boolean` | `false` | 서버사이드 모드. 정렬/필터/페이징을 서버에 위임 (`serverSide`의 권장 alias) |
| `totalRows` | `number` | `0` | 서버사이드 모드에서 전체 행 수. 페이징 UI 계산에 사용 |
| `filterDebounceMs` | `number` | `300` | 서버사이드 필터 변경 emit 딜레이(ms). `0`이면 즉시 emit. IME(한글) 조합 중에는 compositionend 시점까지 자동 보류 |
| `loading` | `boolean` | `false` | `true`이면 그리드에 로딩 오버레이(기본 스켈레톤 또는 `#loading` 슬롯)가 표시되고 `aria-busy="true"`가 자동 적용 |
| `loadingRowCount` | `number` | `5` | 기본 스켈레톤이 렌더할 펄스 라인 수 |
| `emptyText` | `string` | `undefined` | 데이터가 없을 때 기본으로 표시할 문자열. 미지정 시 i18n `aria.empty` 메시지 사용 |
| `checkedIds` | `any[]` | `undefined` | (제어 모드) 체크된 행 id 배열. `v-model:checkedIds`로 양방향 바인딩 가능. 미지정 시 내부 상태 사용 |
| `filters` | `Record<string, any>` | `undefined` | (제어 모드) 컬럼별 필터 상태 맵. `v-model:filters`로 양방향 바인딩 가능. 미지정 시 내부 상태 사용 |
| `sort` | `SortConfig[]` | `undefined` | (제어 모드) 정렬 구성 배열. `v-model:sort`로 양방향 바인딩 가능. 미지정 시 내부 상태 사용 |
| `debug` | `boolean` | `false` | 개발 시 데이터 유효성 경고 활성화. 프로덕션에서는 `false`로 설정 |

::: tip
⚠️ 표시된 prop은 deprecated이며, 권장 이름으로 대체 예정입니다. 두 이름 모두 동작하며, 둘 중 하나라도 `true`이면 기능이 활성화됩니다.
:::

::: details deprecated prop 대체 목록
| 기존 이름 | 권장 이름 |
| :--- | :--- |
| `showColumnSettings` | `useColumnSettings` |
| `showExcelExport` | `useExcelExport` |
| `serverSide` | `useServerSide` |

자세한 내용은 [마이그레이션 가이드](/guide/migration)를 참고하세요.
:::
