# 성능 튜닝 가이드

## 가상 스크롤 vs 페이징

WZ-Grid는 대량 데이터를 다루는 두 가지 전략을 제공합니다.

| | 가상 스크롤 | 페이징 |
| :--- | :--- | :--- |
| **활성화** | 기본값 (자동) | `:use-paging="true"` |
| **UX** | 끊김 없는 무한 스크롤 | 명시적 페이지 이동 |
| **DOM 수** | 뷰포트+버퍼 범위만 렌더링 | 페이지 크기만큼 렌더링 |
| **셀 병합** | 병합 활성 시 자동 비활성화 | 항상 사용 가능 |
| **서버사이드** | 별도 최적화 필요 | 자연스럽게 연동 |

### 가상 스크롤 권장 조건

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :height="600"
  :row-height="40"
/>
```

- `height`를 고정하면 뷰포트 크기가 확정되어 렌더 범위 계산이 정확해집니다.
- `rowHeight`를 실제 행 높이와 일치시켜야 스크롤 위치 계산이 올바릅니다.
- 기본 버퍼(5행)로 부드러운 스크롤을 제공합니다.

### 페이징 권장 조건

- 셀 병합과 함께 사용할 때
- 사용자가 "몇 페이지의 몇 번 항목"처럼 위치를 기억해야 하는 경우
- 서버사이드 페이징과 연동할 때

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :use-paging="true"
  :page-size="50"
/>
```

---

## 셀 병합 활성 시 성능 주의사항

`autoMergeCols` 또는 `mergeCells`가 활성화되면 기본 동작에서 **가상 스크롤이 자동으로 비활성화**됩니다. 이 경우 그리드는 모든 행을 한 번에 렌더링합니다. (opt-in 옵션 `virtualizeWithMerge: true`로 우회 가능 — 아래 4번 항목 참고.)

```vue
<!-- 주의: 이 설정에서는 가상 스크롤이 비활성화됨 -->
<WZGrid
  :columns="columns"
  :rows="rows"
  :auto-merge-cols="['dept', 'team']"
/>
```

**권장 대응 방법:**

1. **페이징 병행 사용** — 병합과 페이징을 함께 사용하면 한 페이지 분량만 렌더링합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :auto-merge-cols="['dept']"
  :use-paging="true"
  :page-size="100"
/>
```

2. **데이터 양 제한** — 병합이 필요한 경우 표시 데이터를 1,000행 이하로 유지하는 것을 권장합니다.

3. **서버사이드 페이징** — 서버에서 페이지 단위로 데이터를 받아 렌더링 행 수 자체를 줄입니다.

4. **`virtualizeWithMerge: true` 활성화** (권장) — 병합 상태에서도 가상 스크롤을 유지합니다. 렌더 범위가 병합 블록 경계까지 자동으로 확장되어 블록이 절단되지 않으면서 viewport 밖 행은 렌더되지 않습니다.

```vue
<WZGrid
  :columns="columns"
  :rows="largeRows"
  :auto-merge-cols="['dept']"
  :virtualize-with-merge="true"
/>
```

병합 블록의 최대 크기가 viewport 높이보다 작을 때 가장 효과적입니다. 자세한 설명은 [셀 병합 가이드](./merge.md#병합-가상-스크롤-virtualizewithmerge) 참고.

---

## 대량 데이터(10K+) 권장 설정

10,000행 이상의 데이터를 다룰 때는 다음 설정을 권장합니다.

### 1. 서버사이드 모드 (최우선 권장)

클라이언트에 전체 데이터를 내려받지 않고 정렬·필터·페이징을 서버에 위임합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="currentPageRows"
  :use-server-side="true"
  :total-rows="totalCount"
  :use-paging="true"
  :page-size="100"
  @sort="handleSort"
  @filter="handleFilter"
  @page-change="handlePageChange"
/>
```

### 2. 가상 스크롤 + rowHeight 고정

클라이언트에 전체 데이터를 유지하되 렌더링만 최소화합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="allRows"
  :height="600"
  :row-height="40"
/>
```

- `rowHeight`를 실제 행 높이와 정확히 일치시키면 렌더 범위 계산 오차를 줄일 수 있습니다.
- 셀 병합은 사용하지 않는 것을 강력히 권장합니다.

### 3. 클라이언트 필터링 한계

`useFilter`는 전체 rows를 매번 순회합니다. 50K 이상의 행에서는 필터 입력 시 체감 지연이 발생할 수 있으므로 서버사이드 모드 전환을 검토하세요.

### 4. 불필요한 컬럼 숨기기

`useColumnSettings`로 사용하지 않는 컬럼을 숨기면 렌더링 셀 수를 줄일 수 있습니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :use-column-settings="true"
/>
```

---

## serverSide 모드 활용법

`useServerSide="true"`로 설정하면 클라이언트 사이드 정렬·필터가 비활성화되고, 해당 이벤트를 서버 API 호출로 위임합니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :use-server-side="true"
  :total-rows="totalCount"
  :use-paging="true"
  :page-size="pageSize"
  v-model:current-page="currentPage"
  @sort="onSort"
  @filter="onFilter"
  @page-change="onPageChange"
/>
```

```ts
async function onSort(configs: SortConfig[]) {
  // configs: [{ key: 'name', order: 'asc' }, ...]
  const result = await api.getEmployees({ sort: configs, page: 1 })
  rows.value = result.data
  totalCount.value = result.total
  currentPage.value = 1
}

async function onFilter(filters: Record<string, any>) {
  const result = await api.getEmployees({ filter: filters, page: 1 })
  rows.value = result.data
  totalCount.value = result.total
  currentPage.value = 1
}

async function onPageChange(page: number) {
  const result = await api.getEmployees({ page, pageSize: pageSize.value })
  rows.value = result.data
}
```

> 서버사이드 모드에서는 `rows`에 **현재 페이지 데이터만** 담아야 합니다. `totalRows`로 전체 행 수를 별도로 전달해 페이지 UI를 구성합니다.
