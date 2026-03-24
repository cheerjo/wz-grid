# Bug Report — 2026-03-18

## Summary
총 4개의 버그 발견, 모두 수정 완료

## 검토 대상 파일
- `src/composables/useSelection.ts`
- `src/composables/useClipboard.ts`
- `src/utils/tsv.ts`
- `src/components/WZGrid.vue`
- `src/components/WZGridRow.vue`

## 발견된 버그

### BUG-001: 방향키 이동 후 이전 셀 하이라이트 잔류
- **파일**: `src/components/WZGrid.vue`, `src/components/WZGridRow.vue`
- **위치**: WZGrid.vue — `useSelection` 구성, WZGridRow — `isSelected` prop 활용
- **심각도**: 🟡 Warning
- **설명**: 마우스로 셀을 클릭한 뒤 방향키로 이동하면, 이전에 선택된 셀의 파란 테두리 및 배경 하이라이트가 지워지지 않고 남아있다.
- **원인**:
  `<td>` 엘리먼트에 `outline-none` CSS가 없어 셀을 마우스 클릭할 때 브라우저가 해당 td에 포커스(browser focus)를 부여하고 기본 파란색 focus outline을 그린다.

  방향키를 누르면:
  1. `moveSelection` → 이전 td의 `tabindex`가 `-1`로 변경됨 (Vue 반응형)
  2. 새 td의 `tabindex`가 `0`으로 변경되고 Vue의 파란 테두리 div가 추가됨
  3. 그러나 **브라우저 포커스는 이전 td에 그대로 유지됨** — `tabindex` 변경은 포커스를 이동시키지 않음
  4. 이전 td가 브라우저 기본 focus outline(파란 테두리)을 계속 표시 → 사용자 눈에는 이전 셀 선택이 남아있는 것처럼 보임

  이는 Vue 반응형 렌더링 문제가 아닌 **브라우저 native focus outline** 문제다. 이전에 적용한 `selectionKey` prop은 Vue 렌더링을 강제하지만 브라우저 포커스 outline에는 영향을 주지 않으므로 효과가 없었다.

- **수정 내용**:

  **Fix 1** — `WZGridRow.vue` td에 `outline-none` 추가:
  td가 브라우저 포커스를 받더라도 기본 focus outline을 표시하지 않는다. 셀 선택 표시는 이미 Vue의 커스텀 파란 테두리 div(`isSelected` v-if)와 `bg-blue-50/50` 배경으로 대체됨.

  **Fix 2** — `WZGrid.vue`에서 `startSelection` 래퍼 추가:
  셀 `mousedown` 시 `containerEl.value?.focus()`를 호출하여 td 대신 그리드 컨테이너가 포커스를 갖도록 한다. 이로써 td가 브라우저 포커스를 가져가지 않아 outline 문제 자체가 발생하지 않는다.

- **수정 전**:
  ```html
  <!-- WZGridRow.vue td — outline-none 없음 -->
  class="border-b border-r border-gray-200 p-0 relative group"
  ```
  ```typescript
  // WZGrid.vue — td mousedown 시 container focus 이동 없음
  const { selection, startSelection, ... } = useSelection();
  ```

- **수정 후**:
  ```html
  <!-- WZGridRow.vue td — outline-none 추가 -->
  class="border-b border-r border-gray-200 p-0 relative group outline-none"
  ```
  ```typescript
  // WZGrid.vue — startSelection 래퍼로 container focus 강제
  const { selection, startSelection: _startSelection, ... } = useSelection();

  const startSelection = (row: number, col: number) => {
    _startSelection(row, col);
    containerEl.value?.focus();
  };
  ```

### BUG-002: Ctrl+C / Ctrl+V 복사 붙여넣기 미작동
- **파일**: `src/components/WZGrid.vue`
- **위치**: 그리드 컨테이너 템플릿, `@copy` / `@paste` 이벤트 바인딩
- **심각도**: 🔴 Critical
- **설명**: 셀 범위를 선택한 후 Ctrl+C로 복사하거나 Ctrl+V로 붙여넣기를 해도 동작하지 않음.
- **원인**:
  ```html
  @copy.self="onCopy"
  @paste.self="onPaste"
  ```
  Vue의 `.self` 이벤트 수식어는 `event.target === 이벤트를 바인딩한 엘리먼트`일 때만 핸들러를 실행한다. 셀을 클릭하면 `<td>`가 브라우저 포커스를 받으므로, Ctrl+C 시 `copy` 이벤트는 `<td>`에서 발생하여 컨테이너로 버블링된다. 이때 `event.target`은 `<td>`이므로 `.self` 조건을 만족하지 못해 `onCopy`가 호출되지 않는다.

  `onCopy` / `onPaste` 내부에는 이미 `INPUT` / `TEXTAREA` / `SELECT` 에서의 이벤트를 조기 반환하는 가드가 있으므로, `.self`는 불필요하며 오히려 동작을 막는 버그다.

- **수정 전**:
  ```html
  @copy.self="onCopy"
  @paste.self="onPaste"
  ```
- **수정 후**:
  ```html
  @copy="onCopy"
  @paste="onPaste"
  ```

### BUG-003: Excel에서 붙여넣기 시 빈 마지막 행이 추가로 덮어써짐
- **파일**: `src/utils/tsv.ts`
- **위치**: `parseTSV` 함수
- **심각도**: 🟡 Warning
- **설명**: Excel에서 데이터를 복사하면 클립보드 텍스트 끝에 `\r\n`이 추가된다. `parseTSV`가 이를 split 하면 빈 마지막 행 `[""]`이 생겨, 의도하지 않은 빈 문자열이 그리드 셀에 덮어써진다.
- **원인**:
  ```ts
  return text.split(/\r?\n/).map(row => row.split('\t'));
  // "a\tb\r\nc\td\r\n" → [["a","b"], ["c","d"], [""]]  ← 빈 마지막 행
  ```
- **수정 전**:
  ```ts
  return text.split(/\r?\n/).map(row => row.split('\t'));
  ```
- **수정 후**:
  ```ts
  // trimEnd()로 후행 \r\n 제거 후 split
  return text.trimEnd().split(/\r?\n/).map(row => row.split('\t'));
  ```

### BUG-004: tag/sparkline 컬럼에 붙여넣기 시 셀 데이터 파괴
- **파일**: `src/composables/useClipboard.ts`
- **위치**: `onPaste` 함수
- **심각도**: 🔴 Critical
- **설명**: `tag` 또는 `sparkline` 컬럼이 선택 범위에 포함될 때 Ctrl+V를 누르면, 문자열이 해당 컬럼에 그대로 저장된다. 두 타입 모두 배열 값을 기대하는 렌더러를 사용하므로 문자열 저장 후 표시가 사라지거나 깨진다.
  - `tag`: 렌더러가 `Array.isArray(row?.[col.key])`를 확인 → 문자열이면 태그가 모두 사라짐
  - `sparkline`: 렌더러가 `Array.isArray(row?.[col.key]) && length >= 2`를 확인 → `"—"` 표시됨
- **원인**: `onPaste`에 컬럼 타입 기반 편집 가능 여부 검사가 없었음. `handleKeyDown` (Delete/Backspace) 핸들러에는 동일 목적의 타입 제외 목록이 있으나, `onPaste`에는 없었음.
- **수정 내용**: `READ_ONLY_TYPES` Set을 정의하고 붙여넣기 대상 컬럼이 해당 타입이면 `updateCell` 호출을 건너뜀.
- **수정 전**:
  ```ts
  if (targetRow < getRows_().length && col) {
    updateCell(targetRow, col.key, cellData);
  }
  ```
- **수정 후**:
  ```ts
  const READ_ONLY_TYPES = new Set(['badge', 'progress', 'image', 'button', 'link', 'tag', 'sparkline']);
  // ...
  if (targetRow < getRows_().length && col && !READ_ONLY_TYPES.has(col.type || '')) {
    updateCell(targetRow, col.key, cellData);
  }
  ```

## 수정 없이 넘어간 항목
- **그룹화 활성 시 방향키 navigation 불일치**: `moveSelection`이 `pagedDataRows.value.length`를 maxRow로 사용하지만, `selection.startRow`는 `pagedItems` 인덱스(그룹 헤더, 소계 포함)이므로 그룹화 활성 시 잘못된 행으로 이동할 수 있다. 별도 이슈로 추적 필요.
- **그룹화 활성 시 clipboard row index 불일치**: `useClipboard`가 `pagedDataRows`를 인덱스로 접근하지만 `selection.startRow`는 `pagedItems` 인덱스여서 그룹화 환경에서 잘못된 행이 복사/붙여넣기될 수 있다. 비그룹화 환경에서는 정상 동작. 별도 이슈로 추적 필요.

## 권고 사항
- 그룹화 환경에서의 키보드 네비게이션 및 클립보드 정확성을 위해 selection 인덱스 체계를 `pagedItems` 기반에서 data row 기반으로 통일하는 리팩토링을 고려할 것.
