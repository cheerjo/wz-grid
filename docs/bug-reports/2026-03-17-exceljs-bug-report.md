# Bug Report — 2026-03-17 (ExcelJS 마이그레이션)

## Summary
총 3개의 버그 발견, 3개 수정 완료

## 검토 대상 파일
- `src/utils/excel.ts`
- `src/components/WZGrid.vue`
- `vite.lib.config.ts`
- `package.json`

## 발견된 버그

### BUG-001: dataBar 조건부 서식에 cfvo 배열 누락으로 런타임 TypeError 발생
- **파일**: `src/utils/excel.ts`
- **위치**: 라인 105–115, `exportExcel` 함수
- **심각도**: 🔴 Critical
- **설명**: `addConditionalFormatting`의 `dataBar` 규칙에 `cfvo` 배열이 없음. ExcelJS의 `DatabarXform.render()`는 `model.cfvo.forEach(...)`를 호출하는데, `cfvo`가 `undefined`이면 `TypeError: Cannot read properties of undefined (reading 'forEach')`가 발생하여 `workbook.xlsx.writeBuffer()`가 reject됨. progress 컬럼이 있는 모든 엑셀 내보내기가 완전히 실패함.
- **원인**: SheetJS의 `!condfmt` 방식에서는 `dataBar` 안에 `minLength`/`maxLength`를 직접 쓰는 구조였지만, ExcelJS API는 min/max value를 `cfvo` 배열(Conditional Formatting Value Objects)로 지정함. 이 API 차이를 인식하지 못하고 SheetJS 방식의 필드명을 그대로 사용한 것이 원인.
- **수정 내용**: `cfvo` 배열에 `{ type: 'num', value: 0 }`과 `{ type: 'num', value: 100 }` 두 항목을 추가하여 0~100 고정 범위를 명시적으로 지정.
- **수정 전**:
  ```typescript
  rules: [
    {
      type: 'dataBar',
      minLength: 0,
      maxLength: 100,
      color: { argb: 'FF638EC6' },
    } as any,
  ],
  ```
- **수정 후**:
  ```typescript
  rules: [
    {
      type: 'dataBar',
      cfvo: [
        { type: 'num', value: 0 },
        { type: 'num', value: 100 },
      ],
      color: { argb: 'FF638EC6' },
    } as any,
  ],
  ```

### BUG-002: async exportExcel을 await 없이 호출하여 오류가 silently dropped
- **파일**: `src/components/WZGrid.vue`
- **위치**: 라인 613, `handleExcelExport` 함수
- **심각도**: 🟡 Warning
- **설명**: SheetJS 버전의 `exportExcel`은 동기 함수였지만, ExcelJS 마이그레이션 후 `async` 함수로 변경됨. `handleExcelExport`는 여전히 동기 화살표 함수로 남아 있어 `exportExcel`의 반환 Promise를 `await`하지 않음. `writeBuffer()` 실패 시(예: BUG-001 같은 상황) 오류가 unhandled promise rejection으로 silently dropped되고 사용자에게 아무 피드백이 없음.
- **원인**: `exportExcel` 시그니처가 `async`로 변경된 후 호출부를 업데이트하지 않음.
- **수정 내용**: `handleExcelExport`를 `async`로, `exportExcel` 호출에 `await` 추가.
- **수정 전**:
  ```typescript
  const handleExcelExport = () => {
    exportExcel(props.columns as Column[], props.rows, {
      filename: props.excelFilename,
      checkedOnly: props.useCheckbox,
      checkedRows: props.rows.filter(r => checkedIds.value.has(r.id)),
    });
  };
  ```
- **수정 후**:
  ```typescript
  const handleExcelExport = async () => {
    await exportExcel(props.columns as Column[], props.rows, {
      filename: props.excelFilename,
      checkedOnly: props.useCheckbox,
      checkedRows: props.rows.filter(r => checkedIds.value.has(r.id)),
    });
  };
  ```

### BUG-003: URL.revokeObjectURL을 a.click() 직후 즉시 호출하여 다운로드 취소 위험
- **파일**: `src/utils/excel.ts`
- **위치**: 라인 125–126, `exportExcel` 함수 내 브라우저 다운로드 섹션
- **심각도**: 🟡 Warning
- **설명**: `a.click()`은 다운로드를 비동기적으로 시작하는데, 바로 다음 줄에서 `URL.revokeObjectURL(url)`을 호출함. Firefox 등 일부 브라우저에서는 오브젝트 URL이 해제된 후 다운로드 요청이 처리되어 다운로드가 취소되거나 빈 파일이 생성될 수 있음. 또한 `document.body`에 `<a>`를 추가하지 않고 `click()`을 호출하는 것도 일부 브라우저(Firefox)에서 작동하지 않을 수 있음.
- **원인**: 브라우저의 비동기 다운로드 시작 타이밍을 고려하지 않은 구현.
- **수정 내용**: `document.body.appendChild(a)` / `removeChild(a)` 추가, `URL.revokeObjectURL`을 `setTimeout(..., 100)`으로 지연.
- **수정 전**:
  ```typescript
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  ```
- **수정 후**:
  ```typescript
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
  ```

## 수정 없이 넘어간 항목

### vite.lib.config.ts — xlsx → exceljs 변경
`external`과 `output.globals` 모두 `xlsx` → `exceljs` / `ExcelJS`로 올바르게 변경되어 있음. 문제 없음.

### package.json — peerDependencies 변경
`xlsx`가 제거되고 `exceljs: ">=4.3.0"`이 optional peerDependency로 추가됨. devDependencies에도 `"exceljs": "^4.4.0"`이 있음. 구조적으로 올바름. `xlsx`가 devDependencies에서도 제거되었는지 확인이 필요하지만, 기존 `package.json`에서 `xlsx`가 devDependency에 있었는지 확인되지 않아 넘어감(git 히스토리에서 SheetJS는 external 처리되어 있었으므로 devDependency이었을 것이나 현재 `package.json`에 `xlsx`가 없으므로 정상).

### dataBar as any 캐스팅
ExcelJS의 TypeScript 타입 정의(`@types/exceljs` 또는 내장 타입)에서 `cfvo` 필드를 `ConditionalFormattingRule`에 포함하지 않을 수 있어 `as any` 캐스팅이 필요할 수 있음. 기능은 동작하므로 현재 유지.

## 권고 사항

1. **ExcelJS 타입 단언**: `rules` 배열의 `as any` 캐스팅 대신 ExcelJS의 `ConditionalFormattingRule` 타입을 직접 import하여 타입 안전성을 높일 것을 권장함.
2. **dataBarCount = 0 엣지케이스**: `dataRowCount`가 0인 경우(빈 데이터) `ref`가 `"A2:A1"` 같은 역전된 범위가 되어 ExcelJS가 경고를 낼 수 있음. 조건부 서식 추가 전 `dataRowCount > 0` 가드를 추가하는 것을 권장.
