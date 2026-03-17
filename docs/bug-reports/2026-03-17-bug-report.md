# Bug Report — 2026-03-17

## Summary
총 3개의 버그 발견, 3개 수정 완료

## 검토 대상 파일
- `src/demos/DemoColumnTypes.vue`
- `src/demos/index.ts`
- `src/components/WZGridRow.vue` (sparkline 검토)

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

### BUG-002: `color`/`tag` 타입 셀 더블클릭 시 값 소실
- **파일**: `src/components/WZGrid.vue`
- **위치**: 라인 896, 함수 `startEditing`
- **심각도**: 🔴 Critical
- **설명**: `color`와 `tag` 타입 셀을 더블클릭하면 편집 모드로 진입하고, `editValue`가 빈 문자열로 초기화됩니다. 편집 모드 UI에 이 두 타입에 대한 input이 없으므로 포커스 이탈 시 `stopEditing(true)`가 호출되어 빈 값이 원래 값을 덮어씁니다.
- **원인**: `startEditing` 내부 진입 차단 목록에 `color`와 `tag`가 누락됨. `boolean`, `radio`, `rating` 등은 이미 차단되어 있었으나 두 타입은 빠져 있었습니다.
- **수정 내용**: 차단 타입 배열에 `'color'`와 `'tag'` 추가
- **수정 전**:
  ```typescript
  if (!row || !col || ['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio', 'rating'].includes(col.type || '')) return;
  ```
- **수정 후**:
  ```typescript
  if (!row || !col || ['boolean', 'progress', 'badge', 'image', 'button', 'link', 'radio', 'rating', 'color', 'tag'].includes(col.type || '')) return;
  ```

### BUG-003: SVG viewBox 높이 하드코딩으로 sparklineHeight 옵션 미반영
- **파일**: `src/components/WZGridRow.vue`
- **위치**: 라인 271, sparkline 템플릿 SVG 요소
- **심각도**: 🟡 Warning
- **설명**: `<svg viewBox="0 0 100 32">` 로 viewBox 높이가 32로 고정되어 있으나, `getSparklinePoints()` 함수는 `col.sparklineHeight || 32` 값을 기준으로 Y 좌표를 계산함. `sparklineHeight`가 32가 아닌 경우(DemoColumnTypes에서 `sparklineHeight: 28` 사용) SVG 내부 좌표 공간과 렌더링 좌표 공간이 불일치함.
- **원인**: viewBox는 SVG 내부 좌표계를 정의하는데, `getSparklinePoints`가 실제 `sparklineHeight` 기반으로 Y를 계산하므로 둘이 반드시 일치해야 함. `sparklineHeight < 32`이면 polyline이 viewBox 상단에 압축 표시되고, `sparklineHeight > 32`이면 하단 일부가 clipping됨.
- **수정 내용**: `viewBox` 속성을 동적 바인딩으로 변경하여 `col.sparklineHeight || 32` 값을 반영
- **수정 전**:
  ```html
  <svg
    v-else-if="Array.isArray(row?.[col.key]) && row[col.key].length >= 2"
    viewBox="0 0 100 32"
    preserveAspectRatio="none"
  ```
- **수정 후**:
  ```html
  <svg
    v-else-if="Array.isArray(row?.[col.key]) && row[col.key].length >= 2"
    :viewBox="'0 0 100 ' + (col.sparklineHeight || 32)"
    preserveAspectRatio="none"
  ```

## 수정 없이 넘어간 항목

- `import { ref } from 'vue'` — 데모 앱 파일이므로 `vue-demi` 불필요 (DemoBasic.vue도 동일 패턴 사용)
- `colTag` 데이터가 `string[]` — tag 타입은 배열 값이 올바름
- `colRating` 데이터가 `number` — rating 타입에 적합
- `handleCellUpdate`에서 `rowIdx` 미사용 — 이벤트 페이로드에 포함되어 있으나 필요하지 않아 무시, 정상
- sparkline SVG 엣지케이스(빈 배열, null, 단일 값): `v-else-if` 조건과 함수 내부 가드로 모두 안전하게 처리됨 ✓
- sparkline Pro 게이팅: `isProLicense=false`일 때 🔒 Pro 정상 표시, prop 전달 경로 완전 ✓
- startEditing/Delete 차단: WZGrid.vue 두 곳 모두 sparkline 포함됨 ✓
- WZGridHeader 필터 비활성화: Pro·Community 양쪽 모두 sparkline 빈 칸 처리 ✓

## 권고 사항
없음
