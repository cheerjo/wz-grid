# Bug Report — 2026-03-17

## Summary
총 1개의 버그 발견, 1개 수정 완료

## 검토 대상 파일
- `src/demos/DemoColumnTypes.vue`
- `src/demos/index.ts`

## 발견된 버그

### BUG-001: licenseKey prop 누락
- **파일**: `src/demos/DemoColumnTypes.vue`
- **위치**: 라인 28-36, `<WZGrid>` 템플릿
- **심각도**: 🔴 Critical
- **설명**: `injectLicense()`로 `licenseKey`를 주입받지만 WZGrid 컴포넌트에 `:licenseKey` prop으로 전달하지 않음
- **원인**: `licenseKey`가 setup()에서 선언되었으나 템플릿 바인딩에서 누락됨. 결과적으로 WZGrid는 항상 빈 문자열 `''`을 licenseKey로 받아 Community 모드로 동작하게 됨
- **수정 내용**: WZGrid에 `:licenseKey="licenseKey"` prop 추가
- **수정 전**:
  ```html
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="560"
    :useCheckbox="true"
    :useFilter="true"
    @update:cell="handleCellUpdate"
    @update:checked="checkedRows = $event"
  />
  ```
- **수정 후**:
  ```html
  <WZGrid
    :columns="columns"
    :rows="rows"
    :height="560"
    :licenseKey="licenseKey"
    :useCheckbox="true"
    :useFilter="true"
    @update:cell="handleCellUpdate"
    @update:checked="checkedRows = $event"
  />
  ```

## 수정 없이 넘어간 항목

- `import { ref } from 'vue'` — 데모 앱 파일이므로 `vue-demi` 불필요 (DemoBasic.vue도 동일 패턴 사용)
- `colTag` 데이터가 `string[]` — tag 타입은 배열 값이 올바름
- `colRating` 데이터가 `number` — rating 타입에 적합
- `handleCellUpdate`에서 `rowIdx` 미사용 — 이벤트 페이로드에 포함되어 있으나 필요하지 않아 무시, 정상

## 권고 사항
없음
