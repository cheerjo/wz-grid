# Bug Report — 2026-03-18

## Summary
총 8개의 버그 발견, 8개 수정 완료 (2차 검토: src/components/ + i18n 레이어)

## 검토 대상 파일
- `docs/.vitepress/components/DemoGrid.vue`
- `docs/.vitepress/components/demos/DemoPaging.vue`
- `docs/.vitepress/components/demos/DemoGrouping.vue`
- `docs/.vitepress/components/demos/DemoMerge.vue`
- `docs/.vitepress/components/demos/DemoCellSlot.vue`
- `docs/.vitepress/components/demos/DemoGettingStarted.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoTree.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoMasterDetail.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoEditing.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoColumnTypes.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoFooter.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoSelection.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoRowStyle.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoAdvancedFilter.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoColumns.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoSortFilter.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoExport.vue` (이상 없음)
- `docs/.vitepress/components/demos/DemoContextMenu.vue` (이상 없음)

## 발견된 버그

### BUG-001: DemoGrid.vue 탭 버튼 인라인 :style 삼항 연산자 파싱 에러
- **파일**: `docs/.vitepress/components/DemoGrid.vue`
- **위치**: 라인 9-18, 탭 버튼 `v-for` 렌더링
- **심각도**: 🔴 Critical
- **설명**: `:style` 바인딩 객체 내에서 `activeTab === tab.id ? 600 : 400` 형태의 삼항 연산자를 사용할 때, Vue 템플릿 파서가 객체 값의 콜론(`:`)을 HTML 속성 바인딩 접두사로 잘못 해석하여 `Unexpected token :` 파싱 에러 발생
- **원인**: Vue 템플릿 파서는 멀티라인 `:style` 객체 내부에서 `key: value` 쌍의 콜론과 삼항 연산자의 `true-branch : false-branch` 구분자인 콜론이 중첩되면 파싱 모호성이 발생함
- **수정 내용**: 복잡한 인라인 스타일 객체를 `getTabStyle(tabId)` 함수로 script setup에 추출하고, 템플릿에서는 `:style="getTabStyle(tab.id)"`로 단순화
- **수정 전**:
  ```html
  :style="{
    padding: '6px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: activeTab === tab.id ? 600 : 400,
    background: activeTab === tab.id ? '#3b82f6' : '#e5e7eb',
    color: activeTab === tab.id ? '#fff' : '#374151',
    fontSize: '13px',
  }"
  ```
- **수정 후**:
  ```html
  :style="getTabStyle(tab.id)"
  ```
  ```typescript
  const getTabStyle = (tabId: string) => ({
    padding: '6px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: activeTab.value === tabId ? 600 : 400,
    background: activeTab.value === tabId ? '#3b82f6' : '#e5e7eb',
    color: activeTab.value === tabId ? '#fff' : '#374151',
    fontSize: '13px',
  });
  ```

---

### BUG-002: DemoPaging.vue 탭 버튼 인라인 :style 삼항 연산자 파싱 에러
- **파일**: `docs/.vitepress/components/demos/DemoPaging.vue`
- **위치**: 라인 9-19, 탭 버튼 렌더링
- **심각도**: 🔴 Critical
- **설명**: BUG-001과 동일한 패턴. `:style` 객체 내 삼항 연산자로 인한 `Unexpected token :` 파싱 에러
- **원인**: BUG-001과 동일
- **수정 내용**: `getTabStyle(tabId)` 함수를 script setup에 추출하고 템플릿 단순화
- **수정 전**: (BUG-001과 동일한 패턴)
- **수정 후**: (BUG-001과 동일한 패턴)

---

### BUG-003: DemoGrouping.vue 탭 버튼 인라인 :style 삼항 연산자 파싱 에러
- **파일**: `docs/.vitepress/components/demos/DemoGrouping.vue`
- **위치**: 라인 9-19, 탭 버튼 렌더링
- **심각도**: 🔴 Critical
- **설명**: BUG-001과 동일한 패턴
- **원인**: BUG-001과 동일
- **수정 내용**: `getTabStyle(tabId)` 함수를 script setup에 추출하고 템플릿 단순화

---

### BUG-004: DemoMerge.vue 탭 버튼 인라인 :style 삼항 연산자 파싱 에러
- **파일**: `docs/.vitepress/components/demos/DemoMerge.vue`
- **위치**: 라인 9-19, 탭 버튼 렌더링
- **심각도**: 🔴 Critical
- **설명**: BUG-001과 동일한 패턴
- **원인**: BUG-001과 동일
- **수정 내용**: `getTabStyle(tabId)` 함수를 script setup에 추출하고 템플릿 단순화

---

### BUG-005: DemoCellSlot.vue 슬롯 내 인라인 :style 삼항 연산자 파싱 에러
- **파일**: `docs/.vitepress/components/demos/DemoCellSlot.vue`
- **위치**: 라인 23-31 (`#cell-status` 슬롯), 라인 47-54 (`#cell-score` 슬롯)
- **심각도**: 🔴 Critical
- **설명**: `#cell-status` 슬롯의 뱃지 span과 `#cell-score` 슬롯의 프로그레스 바 div에서 `:style` 객체 내 중첩 삼항 연산자(`value === 'Active' ? '#dcfce7' : value === 'Pending' ? '#fef9c3' : '#fee2e2'`)로 인한 파싱 에러. `value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444'` 패턴도 동일한 문제 유발
- **원인**: 중첩 삼항 연산자에서 두 번째 콜론이 Vue 템플릿 파서에 의해 잘못 해석됨
- **수정 내용**: 두 스타일 객체를 각각 `getStatusStyle(value)`, `getScoreBarStyle(value)` 함수로 script setup에 추출
- **수정 전**:
  ```html
  <!-- 상태 뱃지 -->
  <span
    :style="{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 600,
      background: value === 'Active' ? '#dcfce7' : value === 'Pending' ? '#fef9c3' : '#fee2e2',
      color:      value === 'Active' ? '#15803d' : value === 'Pending' ? '#a16207' : '#b91c1c',
    }"
  >{{ value }}</span>

  <!-- 점수 프로그레스 바 -->
  <div
    :style="{
      height: '100%',
      width: Math.min(100, Math.max(0, (value / 100) * 100)) + '%',
      background: value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444',
      borderRadius: '4px',
      transition: 'width 0.3s',
    }"
  />
  ```
- **수정 후**:
  ```html
  <span :style="getStatusStyle(value)">{{ value }}</span>
  <div :style="getScoreBarStyle(value)" />
  ```
  ```typescript
  const getStatusStyle = (value: string) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600,
    background: value === 'Active' ? '#dcfce7' : value === 'Pending' ? '#fef9c3' : '#fee2e2',
    color: value === 'Active' ? '#15803d' : value === 'Pending' ? '#a16207' : '#b91c1c',
  });

  const getScoreBarStyle = (value: number) => ({
    height: '100%',
    width: Math.min(100, Math.max(0, (value / 100) * 100)) + '%',
    background: value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444',
    borderRadius: '4px',
    transition: 'width 0.3s',
  });
  ```

---

## 수정 없이 넘어간 항목 (1차 검토)
없음. 발견된 모든 파싱 에러 패턴은 수정 완료.

## 권고 사항 (1차 검토)
1. **코딩 컨벤션 정립**: Vue 템플릿 `:style` 바인딩에서 삼항 연산자가 포함된 객체는 반드시 script의 함수나 computed로 추출하는 것을 팀 컨벤션으로 명문화할 것.
2. **ESLint 규칙 고려**: `vue/no-parsing-error` 규칙과 함께 복잡한 인라인 표현식을 감지하는 커스텀 규칙 추가를 검토할 것.
3. **패턴 일관성**: 현재 수정된 4개의 탭 컴포넌트(`DemoGrid`, `DemoPaging`, `DemoGrouping`, `DemoMerge`)가 모두 동일한 탭 UI 패턴을 사용하므로, 공통 `DemoTabBar` 컴포넌트로 추출하면 유지보수 부담을 줄일 수 있음.

---

# 2차 검토 — src/components/ + i18n 레이어 (2026-03-18)

## 검토 대상 파일
- `src/components/WZGrid.vue`
- `src/components/WZGridToolbar.vue`
- `src/components/WZGridHeader.vue`
- `src/components/WZGridRow.vue`
- `src/components/WZContextMenu.vue`
- `src/components/WZGridPagination.vue`
- `src/composables/useValidation.ts`
- `src/i18n/ko.ts`
- `src/i18n/en.ts`

## 발견된 버그

### BUG-006: aria 정렬 알림 메시지에 정렬 방향 텍스트 하드코딩
- **파일**: `src/components/WZGrid.vue`
- **위치**: 라인 1052, `watch(sortConfigs, ...)` 콜백
- **심각도**: 🟡 Warning
- **설명**: aria-live 영역의 정렬 방향 텍스트("오름차순"/"내림차순")가 `t()` 없이 한국어로 하드코딩됨. `locale='en'` 설정에서도 스크린리더가 한국어로 읽음.
- **원인**: Phase 4 a11y 작업 시 `aria.asc` / `aria.desc` i18n 키를 추가하지 않고 인라인 한국어 문자열 삽입.
- **수정 내용**: `aria.asc`/`aria.desc` 키를 ko.ts·en.ts에 추가하고 `t()` 호출로 교체.
- **수정 전**:
  ```typescript
  const desc = configs.map(c => `${c.key} ${c.order === 'asc' ? '오름차순' : '내림차순'}`).join(', ');
  ```
- **수정 후**:
  ```typescript
  const desc = configs.map(c => `${c.key} ${t(c.order === 'asc' ? 'aria.asc' : 'aria.desc')}`).join(', ');
  ```

---

### BUG-007: useValidation 필수 입력 오류 메시지 한국어 하드코딩
- **파일**: `src/composables/useValidation.ts`
- **위치**: 라인 120, `validateCell` 함수
- **심각도**: 🟡 Warning
- **설명**: `col.required` 검증 실패 시 오류 메시지가 한국어 문자열 리터럴로 하드코딩됨. i18n에 `validation.required` 키가 존재하나 사용하지 않아 `locale='en'`에서도 한국어 오류 메시지 노출.
- **원인**: Phase 2 i18n 작업 시 컴포넌트·템플릿에만 `t()` 적용, composable 레이어 누락.
- **수정 내용**:
  1. `useValidation`에 optional `t?: TFunction` 파라미터 추가.
  2. `validateCell` 내부에서 `t` 존재 시 `t('validation.required', { title })` 사용, 없으면 폴백 문자열.
  3. `WZGrid.vue`의 `useValidation(...)` 호출에 `t` 전달.
- **수정 전**:
  ```typescript
  export function useValidation(getRows, getColumns) {
    ...
    errors[k] = `${col.title}은(는) 필수 입력 항목입니다.`;
  ```
- **수정 후**:
  ```typescript
  export function useValidation(getRows, getColumns, t?: TFunction) {
    ...
    errors[k] = t
      ? t('validation.required', { title: col.title })
      : `${col.title}은(는) 필수 입력 항목입니다.`;
  ```

---

### BUG-008: ko.ts pagination.pageSize 번역 누락
- **파일**: `src/i18n/ko.ts`
- **위치**: 라인 37
- **심각도**: 🔵 Info
- **설명**: 한국어 locale에서 페이지 크기 레이블이 영문 `'Page Size:'`로 표시됨.
- **원인**: Phase 2 i18n 작업 시 번역 미완성.
- **수정 전**: `pageSize: 'Page Size:'`
- **수정 후**: `pageSize: '페이지 크기:'`

---

## 수정 없이 넘어간 항목 (2차 검토)

- **`WZContextMenu.vue` `<teleport>` Vue 2 호환성**: Vue 3 전용 기능. 프로젝트 실질 운영 환경이 Vue 3이므로 런타임 오류는 없으나 CLAUDE.md Vue 2/3 동시 지원 명세와 불일치. 별도 대응 필요.
- **`WZGridRow.vue:10` aria-rowindex 페이지 오프셋 미반영**: 페이지 2 이상에서 aria-rowindex가 전체 데이터 기준이 아닌 현재 페이지 내 인덱스로 설정. 수정 시 WZGridRow에 페이지 오프셋 prop 추가 필요 — 별도 작업으로 처리 권고.

## 권고 사항 (2차 검토)

- `useValidation` composable이 `t` 없이도 동작하는 폴백을 유지하여 외부 사용성 보장. WZGrid 외부에서 `useValidation` 단독 사용 시 한국어 폴백 노출 가능 — 필요 시 별도 i18n 주입 방안 검토.
