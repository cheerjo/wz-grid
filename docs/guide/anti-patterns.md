# 안티패턴

WZ-Grid를 사용할 때 흔히 발생하는 실수와 올바른 방법을 정리합니다.

> `debug` prop을 활성화하면 이 중 일부 문제를 자동으로 감지할 수 있습니다. [디버깅 가이드](/guide/debugging)를 참고하세요.

---

## 1. rows에 id 필드 누락

**문제:** WZ-Grid는 각 행을 고유하게 식별하기 위해 `id` 필드를 필수로 요구합니다. 누락 시 선택, 편집, 체크박스, 트리 토글 등이 오동작합니다.

```ts
// ❌ 잘못된 예 — id 없음
const rows = ref([
  { name: '홍길동', dept: '개발팀' },
  { name: '김철수', dept: '사업팀' },
])
```

```ts
// ✅ 올바른 예 — 고유한 id 필수
const rows = ref([
  { id: 1, name: '홍길동', dept: '개발팀' },
  { id: 2, name: '김철수', dept: '사업팀' },
])
```

서버 응답에 `id`가 없는 경우 클라이언트에서 추가하세요.

```ts
rows.value = apiResponse.data.map((item, index) => ({ ...item, id: item.seq ?? index }))
```

---

## 2. rows를 직접 변경하기 (반응형 깨짐)

**문제:** `rows.value`의 배열 원소를 직접 교체하거나 `push`/`splice`로 조작하면 Vue의 반응형이 정상 동작하지 않을 수 있습니다. 특히 `useValidation`의 변경 감지는 배열 레퍼런스 교체를 기준으로 동작합니다.

```ts
// ❌ 잘못된 예 — 원소 직접 교체
rows.value[0] = { id: 1, name: '변경된 이름', dept: '개발팀' }

// ❌ 잘못된 예 — 내부 필드만 수정 (useValidation 변경 감지 안 됨)
rows.value[0].name = '변경된 이름'
```

```ts
// ✅ 올바른 예 — 배열을 새로 생성
rows.value = rows.value.map(r =>
  r.id === targetId ? { ...r, name: '변경된 이름' } : r
)
```

`@update:cell` 이벤트에서 셀 값을 업데이트할 때도 같은 원칙을 적용합니다.

```ts
// ✅ update:cell 핸들러 권장 패턴
function onCellUpdate({ row, key, value }) {
  rows.value = rows.value.map(r =>
    r.id === row.id ? { ...r, [key]: value } : r
  )
}
```

---

## 3. 셀 병합 + 대량 데이터 조합

**문제:** `autoMergeCols` 또는 `mergeCells`가 활성화되면 가상 스크롤이 비활성화되고 **전체 행을 DOM에 렌더링**합니다. 1,000행 이상에서 눈에 띄는 성능 저하가 발생합니다.

```vue
<!-- ❌ 위험한 조합 — 10,000행 + 셀 병합 -->
<WZGrid
  :rows="tenThousandRows"
  :auto-merge-cols="['dept']"
/>
```

**대응 방법:**

```vue
<!-- ✅ 페이징 병행 — 렌더링 행 수를 줄임 -->
<WZGrid
  :rows="tenThousandRows"
  :auto-merge-cols="['dept']"
  :use-paging="true"
  :page-size="100"
/>
```

```vue
<!-- ✅ 또는 서버사이드 — 필요한 페이지만 내려받음 -->
<WZGrid
  :rows="currentPageRows"
  :auto-merge-cols="['dept']"
  :use-server-side="true"
  :total-rows="totalCount"
  :use-paging="true"
/>
```

자세한 내용은 [성능 튜닝 가이드](/guide/performance)를 참고하세요.

---

## 4. select 컬럼에 options 누락

**문제:** `type: 'select'`인 컬럼에 `options`가 없으면 드롭다운이 빈 상태로 렌더링되고, 편집 후 값이 레이블 없이 표시됩니다.

```ts
// ❌ 잘못된 예 — options 누락
const columns = ref([
  { key: 'status', title: '상태', type: 'select' },
])
```

```ts
// ✅ 올바른 예
const columns = ref([
  {
    key: 'status',
    title: '상태',
    type: 'select',
    options: [
      { value: 'active',   label: '활성' },
      { value: 'inactive', label: '비활성' },
      { value: 'pending',  label: '대기' },
    ],
  },
])
```

`badge`, `radio` 타입도 동일하게 `options`가 필요합니다.

---

## 5. column.key와 row 데이터 필드명 불일치

**문제:** `column.key`가 row 데이터의 실제 필드명과 다르면 해당 컬럼은 항상 빈 값으로 표시됩니다.

```ts
// ❌ 잘못된 예 — key 불일치
const columns = ref([
  { key: 'department', title: '부서' },  // 'department'
])
const rows = ref([
  { id: 1, dept: '개발팀' },             // 'dept'
])
```

```ts
// ✅ 올바른 예 — 필드명 일치
const columns = ref([
  { key: 'dept', title: '부서' },
])
```

서버 응답 필드명이 다를 경우 데이터 수신 시점에 정규화합니다.

```ts
rows.value = apiResponse.data.map(item => ({
  id: item.empId,
  name: item.empName,    // empName → name
  dept: item.deptNm,     // deptNm → dept
}))
```

---

## 6. height 미지정 시 가상 스크롤 오작동

**문제:** `height` prop을 지정하지 않거나 `0`으로 설정하면 뷰포트 높이 계산이 불가능하여 가상 스크롤이 올바르게 동작하지 않습니다.

```vue
<!-- ❌ height 없음 — 가상 스크롤 비정상 동작 가능 -->
<WZGrid :columns="columns" :rows="rows" />
```

```vue
<!-- ✅ 고정 height 지정 -->
<WZGrid :columns="columns" :rows="rows" :height="600" />
```

반응형 높이가 필요한 경우 CSS로 제어합니다.

```vue
<div style="height: calc(100vh - 120px)">
  <WZGrid :columns="columns" :rows="rows" :height="containerHeight" />
</div>
```

---

## 7. 서버사이드 모드에서 rows에 전체 데이터 할당

**문제:** `useServerSide="true"`로 설정하고도 `rows`에 전체 데이터를 넣으면 불필요한 메모리를 차지하고 초기 렌더링이 느려집니다.

```ts
// ❌ 잘못된 예 — serverSide인데 전체 데이터 할당
rows.value = await api.getAllEmployees()  // 100,000건
```

```ts
// ✅ 올바른 예 — 현재 페이지 데이터만
rows.value = await api.getEmployees({ page: 1, pageSize: 100 })
totalCount.value = response.total
```

---

## 8. columns를 매 렌더마다 새로 생성

**문제:** `columns` 배열을 컴포넌트 template 또는 computed 안에서 매번 새로 생성하면 WZGrid가 불필요하게 재렌더링됩니다.

```vue
<!-- ❌ 잘못된 예 — template에서 인라인 배열 -->
<WZGrid :columns="[{ key: 'name', title: '이름' }]" :rows="rows" />
```

```ts
// ✅ 올바른 예 — ref 또는 setup() 최상단에서 한 번만 생성
const columns = ref([
  { key: 'name', title: '이름', width: 150 },
])
```
