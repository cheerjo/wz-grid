# 정렬 & 필터

## 라이브 데모

<ClientOnly>
  <DemoSortFilter />
</ClientOnly>

## 정렬 (Sort)

헤더 셀 클릭으로 정렬할 수 있습니다. **WZGrid가 내부적으로 클라이언트 사이드 정렬을 자동 수행**하므로, 별도 핸들러 없이도 정렬이 동작합니다.

### 단일 정렬

헤더 클릭 시 오름차순(▲) ↔ 내림차순(▼) 토글. 다시 클릭하면 정렬 해제.

### 다중 정렬

`Shift + 헤더 클릭`으로 여러 컬럼을 동시에 정렬합니다.

- 정렬된 컬럼 헤더에 순서 번호(①②③…)와 방향 화살표 표시
- 이미 정렬 중인 컬럼을 Shift+클릭하면 방향 토글 → 해제 순으로 변경

### 서버사이드 모드

서버사이드 모드(`serverSide` prop)에서는 내부 정렬이 비활성화되고, `@sort` 이벤트를 통해 외부에서 처리해야 합니다.

```ts
import type { SortConfig } from '@wezon/wz-grid-vue'

const handleSort = async (configs: SortConfig[]) => {
  const params = configs.map(c => `${c.key}:${c.order}`).join(',')
  const res = await fetch(`/api/data?sort=${params}`)
  rows.value = await res.json()
}
```

```vue
<WZGrid :serverSide="true" @sort="handleSort" />
```

## 필터 (Filter)

`useFilter` prop을 `true`로 설정하면 헤더 아래에 컬럼별 텍스트 입력 필터 행이 나타납니다.

```vue
<WZGrid :useFilter="true" ... />
```

- 각 컬럼 입력창에 텍스트를 입력하면 부분 일치 필터링 적용
- 여러 컬럼에 동시에 필터 적용 가능 (AND 조건)
- 필터 변경 시 1페이지로 자동 이동
