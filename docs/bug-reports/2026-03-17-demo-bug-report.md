# Bug Report — 2026-03-17 (VitePress Demo Components)

## Summary
총 2개의 버그 발견, 2개 수정 완료

## 검토 대상 파일
- `docs/.vitepress/theme/index.ts`
- `docs/.vitepress/components/demos/sampleData.ts`
- `docs/.vitepress/components/demos/DemoGettingStarted.vue`
- `docs/.vitepress/components/demos/DemoColumnTypes.vue`
- `docs/.vitepress/components/demos/DemoColumns.vue`
- `docs/.vitepress/components/demos/DemoEditing.vue`
- `docs/.vitepress/components/demos/DemoSortFilter.vue`
- `docs/.vitepress/components/demos/DemoPaging.vue`
- `docs/.vitepress/components/demos/DemoGrouping.vue`
- `docs/.vitepress/components/demos/DemoTree.vue`
- `docs/.vitepress/components/demos/DemoMasterDetail.vue`
- `docs/.vitepress/components/demos/DemoMerge.vue`
- `docs/.vitepress/components/demos/DemoSelection.vue`
- `docs/.vitepress/components/demos/DemoContextMenu.vue`
- `docs/.vitepress/components/demos/DemoAdvancedFilter.vue`
- `docs/.vitepress/components/demos/DemoRowStyle.vue`
- `docs/.vitepress/components/demos/DemoFooter.vue`
- `docs/.vitepress/components/demos/DemoCellSlot.vue`
- `docs/.vitepress/components/demos/DemoExport.vue`

## 발견된 버그

### BUG-001: DemoContextMenu — update:cell 핸들러에서 잘못된 파라미터명 사용
- **파일**: `docs/.vitepress/components/demos/DemoContextMenu.vue`
- **위치**: 60번 줄, `onUpdateCell` 함수
- **심각도**: 🔴 Critical
- **설명**: `@update:cell` 이벤트 핸들러가 페이로드에서 `key`를 구조 분해하지만, WZGrid가 emit하는 실제 페이로드는 `colKey`를 사용합니다.
- **원인**: `WZGrid.vue` 794번 줄에서 `emit('update:cell', { rowIdx, row, colKey: key, value: val })`로 emit됩니다. 핸들러가 `key`로 구조 분해하면 항상 `undefined`가 되어 셀 편집이 반영되지 않습니다.
- **수정 내용**: `key`를 `colKey`로 수정하고, `(target as any)[key]`를 `(target as any)[colKey]`로 변경
- **수정 전**:
  ```typescript
  function onUpdateCell({ row, key, value }: { row: any; key: string; value: any }) {
    const target = rows.value.find((r) => r.id === row.id);
    if (target) {
      (target as any)[key] = value;
    }
  }
  ```
- **수정 후**:
  ```typescript
  function onUpdateCell({ row, colKey, value }: { row: any; colKey: string; value: any }) {
    const target = rows.value.find((r) => r.id === row.id);
    if (target) {
      (target as any)[colKey] = value;
    }
  }
  ```

---

### BUG-002: DemoMerge — mergeCells prop에 배열을 전달 (함수 타입 불일치)
- **파일**: `docs/.vitepress/components/demos/DemoMerge.vue`
- **위치**: 70-73번 줄, `manualMergeCells` 상수
- **심각도**: 🔴 Critical
- **설명**: `manualMergeCells`를 `[{ row, col, rowspan }]` 형태의 배열로 선언하여 `:merge-cells` prop에 바인딩합니다. 그러나 WZGrid의 `mergeCells` prop은 `(row: any, colKey: string) => { rowspan?: number; colspan?: number } | null | void` 형태의 함수여야 합니다.
- **원인**: 배열을 전달하면 두 가지 문제가 발생합니다. (1) `!!effMergeCells.value`가 truthy (배열은 truthy)가 되어 가상 스크롤이 비활성화됩니다. (2) `useMerge.ts` 내부에서 `mergeCellsFn(row, col.key)`를 호출할 때 런타임 TypeError가 발생합니다 (배열은 함수가 아님).
- **수정 내용**: 배열 대신 `(row, colKey) => { rowspan? } | null` 형태의 함수로 교체. row의 id를 기준으로 `mergeRows` 배열에서 rowIdx를 계산하여 병합 조건 판단.
- **수정 전**:
  ```typescript
  const manualMergeCells = [
    { row: 0, col: 0, rowspan: 3 },
    { row: 0, col: 1, rowspan: 2 },
  ];
  ```
- **수정 후**:
  ```typescript
  const manualMergeCells = (row: any, colKey: string) => {
    const rows = mergeRows.value;
    const rowIdx = rows.findIndex((r) => r.id === row.id);
    if (colKey === 'dept' && rowIdx === 0) return { rowspan: 3 };
    if (colKey === 'team' && rowIdx === 0) return { rowspan: 2 };
    return null;
  };
  ```

---

## 수정 없이 넘어간 항목

### import { ref } from 'vue' (모든 데모 파일)
데모 파일들이 `vue-demi` 대신 `vue`를 직접 import합니다. 이는 라이브러리 소스코드(`src/`)가 아닌 VitePress 문서 데모 파일이므로 정상입니다. VitePress는 Vue 3 환경에서 실행되며 `vue` 직접 import가 올바릅니다.

### DemoSortFilter — @sort 핸들러에서 rows.value 수동 정렬
`@sort` 이벤트를 수신하여 `rows.value`를 직접 정렬하지만, WZGrid는 클라이언트 사이드 모드에서 내부적으로도 정렬을 수행합니다. 결과적으로 이중 정렬이 발생하지만 최종 표시 결과는 동일하므로 오동작은 없습니다. 데모 의도(sort 이벤트 수신 방법 시연)를 해치지 않아 수정하지 않았습니다.

### DemoMasterDetail — use-detail prop 없음
`#detail` 슬롯만 사용하는 것이 맞습니다. WZGrid에서 `effUseDetail`은 `hasDetailSlot`을 자동 감지하므로 별도 prop이 필요 없습니다.

## 권고 사항
- `mergeCells` prop의 타입이 함수임을 공식 문서와 데모에 명확히 표기 권장. 현재 배열로 오해하기 쉬운 이름입니다.
- `update:cell` 이벤트 페이로드 구조 (`{ rowIdx, row, colKey, value }`)를 API 문서에 명시 권장.
