# Props

## 필수 Props

| Prop | 타입 | 설명 |
| :--- | :--- | :--- |
| `columns` | `Column[]` | 컬럼 정의 배열 |
| `rows` | `any[]` | 행 데이터 배열. 각 객체는 `id` 필드 필요 |

## Community Props

모든 티어에서 사용 가능한 Props입니다.

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

## Pro Props <Badge type="warning" text="Pro" />

`licenseKey`에 유효한 Pro/Enterprise 키를 전달해야 동작합니다.

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `licenseKey` | `string` | `''` | Pro/Enterprise 라이선스 키 |
| `showColumnSettings` | `boolean` | `false` | 컬럼 표시/숨기기 설정 버튼 표시 |
| `useContextMenu` | `boolean` | `false` | 우클릭 컨텍스트 메뉴 사용 |
| `useRowDrag` | `boolean` | `false` | 행 드래그 재배치 활성화 |
| `groupBy` | `string` | `''` | 그룹핑 기준 컬럼 key |
| `autoMergeCols` | `string[]` | `[]` | 인접한 동일 값 셀을 자동 병합할 컬럼 key 목록 |
| `mergeCells` | `MergeCell[]` | `[]` | 수동 셀 병합 규칙 목록 |
| `showExcelExport` | `boolean` | `false` | 툴바에 Excel 내보내기 버튼 표시 |
| `excelFilename` | `string` | `'export.xlsx'` | Excel 저장 파일명 |

::: tip
Pro Props는 `licenseKey` 없이 전달해도 오류는 나지 않지만, 해당 기능이 비활성화됩니다.
Excel 버튼 클릭 시에는 업그레이드 안내 모달이 표시됩니다.
:::
