# 서버사이드 모드

`serverSide` prop을 `true`로 설정하면 정렬, 필터링, 페이징을 클라이언트에서 처리하지 않고 이벤트를 통해 서버에 위임합니다.

## 기본 사용법

```vue
<WZGrid
  :columns="columns"
  :rows="currentPageRows"
  :serverSide="true"
  :totalRows="serverTotalCount"
  :usePaging="true"
  :useFilter="true"
  v-model:currentPage="currentPage"
  v-model:pageSize="pageSize"
  @sort="handleServerSort"
  @update:filters="handleServerFilter"
  @update:currentPage="fetchData"
  @update:pageSize="fetchData"
/>
```

## 클라이언트 vs 서버사이드 비교

| 기능 | 클라이언트 모드 (기본) | 서버사이드 모드 |
|:-----|:----------------------|:---------------|
| 필터링 | `useFilter`로 클라이언트에서 필터 | 필터 UI 유지, `@update:filters` 이벤트 emit |
| 정렬 | `@sort` 이벤트로 클라이언트 처리 | `@sort` 이벤트로 서버에 위임 (동일) |
| 페이징 | `activeItems`를 슬라이싱 | `rows`를 현재 페이지 데이터로 직접 사용 |
| 전체 행 수 | `rows.length`에서 자동 계산 | `totalRows` prop으로 전달 |

## 필수 Props

| Prop | 타입 | 설명 |
|:-----|:-----|:-----|
| `serverSide` | `boolean` | `true`로 설정 |
| `totalRows` | `number` | 서버의 전체 행 수 (페이징 계산에 필요) |
| `rows` | `any[]` | **현재 페이지의 데이터만** 전달 |

## @update:filters 이벤트

고급 필터 사용 시 필터 타입에 따라 구조화된 페이로드가 전달됩니다.

### Debounce & IME 처리

서버사이드 모드에서 사용자가 필터 인풋을 타이핑하면 매 입력마다 서버 요청이 발생하는 것을 피하기 위해, 그리드는 **자동으로 emit을 debounce**합니다.

| 항목 | 동작 |
|:-----|:-----|
| 기본 딜레이 | 마지막 변경 후 `300ms` 경과 시 `@update:filters` emit |
| 조정 | `filterDebounceMs` prop으로 재정의. `0`이면 즉시 emit |
| IME 보호 | 한글·일본어·중국어 등 IME 조합 중에는 `compositionend`까지 emit 보류 후 한 번에 전송 |
| unmount | 대기 중인 debounce 타이머는 unmount 시점에 취소되어 leak 없음 |

```vue
<!-- 500ms로 지연을 넓히기 -->
<WZGrid
  :serverSide="true"
  :useFilter="true"
  :filterDebounceMs="500"
  @update:filters="handleServerFilter"
/>

<!-- 즉시 emit (테스트/자동화용) -->
<WZGrid
  :serverSide="true"
  :useFilter="true"
  :filterDebounceMs="0"
  @update:filters="handleServerFilter"
/>
```

## 로딩 오버레이 / 빈 상태

서버 응답 대기 중에는 `loading` prop으로 스켈레톤/커스텀 오버레이를 표시하고, 결과가 0건일 때는 `#empty` 슬롯으로 안내 화면을 렌더합니다.

```vue
<WZGrid
  :serverSide="true"
  :rows="currentPageRows"
  :loading="isFetching"
  :loadingRowCount="6"
  emptyText="조건에 맞는 데이터가 없습니다."
>
  <template #loading>
    <div class="text-sm text-gray-500">불러오는 중...</div>
  </template>
  <template #empty>
    <button class="text-blue-500 text-sm" @click="fetchData">다시 시도</button>
  </template>
</WZGrid>
```

로딩 중에는 컨테이너와 테이블 모두에 `aria-busy="true"`가 자동 부여됩니다.

```ts
// 페이로드 예시
{
  name: { value: '홍' },                    // 텍스트 필터
  salary: { min: '30000', max: '80000' },   // 숫자 범위 필터
  joinDate: { from: '2024-01-01', to: '2024-12-31' }, // 날짜 범위 필터
  dept: { values: ['dev', 'hr'] },          // 다중 선택 필터
}
```

## 전체 예시

```ts
const currentPage = ref(1);
const pageSize = ref(20);
const currentPageRows = ref<any[]>([]);
const serverTotalCount = ref(0);
let currentFilters: Record<string, any> = {};
let currentSort: SortConfig[] = [];

const fetchData = async () => {
  const params = new URLSearchParams({
    page: String(currentPage.value),
    size: String(pageSize.value),
  });

  // 정렬 파라미터
  if (currentSort.length > 0) {
    params.set('sortKey', currentSort[0].key);
    params.set('sortOrder', currentSort[0].order);
  }

  // 필터 파라미터
  for (const [key, filter] of Object.entries(currentFilters)) {
    if (filter.value) params.set(`filter_${key}`, filter.value);
    if (filter.min) params.set(`filter_${key}_min`, filter.min);
    if (filter.max) params.set(`filter_${key}_max`, filter.max);
  }

  const res = await fetch(`/api/employees?${params}`);
  const data = await res.json();
  currentPageRows.value = data.items;
  serverTotalCount.value = data.total;
};

const handleServerSort = (configs: SortConfig[]) => {
  currentSort = configs;
  fetchData();
};

const handleServerFilter = (filters: Record<string, any>) => {
  currentFilters = filters;
  currentPage.value = 1;
  fetchData();
};

onMounted(fetchData);
```

## 주의사항

- 서버사이드 모드에서 `rows`는 **현재 페이지의 데이터만** 전달해야 합니다.
- `totalRows`를 반드시 설정해야 페이징 UI가 올바르게 표시됩니다.
- 트리 모드(`useTree`)와 그룹핑(`groupBy`)은 서버사이드 모드와 함께 사용하지 않는 것을 권장합니다.
