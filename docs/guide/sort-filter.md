# 정렬 & 필터

## 정렬 (Sort)

헤더 셀 클릭으로 정렬 이벤트를 발생시킵니다. **실제 정렬 로직은 부모 컴포넌트에서 처리합니다.**

### 단일 정렬

헤더 클릭 시 오름차순(▲) ↔ 내림차순(▼) 토글. 다시 클릭하면 정렬 해제.

### 다중 정렬

`Shift + 헤더 클릭`으로 여러 컬럼을 동시에 정렬합니다.

- 정렬된 컬럼 헤더에 순서 번호(①②③…)와 방향 화살표 표시
- 이미 정렬 중인 컬럼을 Shift+클릭하면 방향 토글 → 해제 순으로 변경

```ts
import type { SortConfig } from 'wz-grid'

const handleSort = (configs: SortConfig[]) => {
  if (configs.length === 0) return
  rows.value = [...rows.value].sort((a, b) => {
    for (const { key, order } of configs) {
      const modifier = order === 'asc' ? 1 : -1
      if (a[key] !== b[key]) return (a[key] > b[key] ? 1 : -1) * modifier
    }
    return 0
  })
}
```

```vue
<WZGrid ... @sort="handleSort" />
```

## 필터 (Filter)

`useFilter` prop을 `true`로 설정하면 헤더 아래에 컬럼별 텍스트 입력 필터 행이 나타납니다.

```vue
<WZGrid :useFilter="true" ... />
```

- 각 컬럼 입력창에 텍스트를 입력하면 부분 일치 필터링 적용
- 여러 컬럼에 동시에 필터 적용 가능 (AND 조건)
- 필터 변경 시 1페이지로 자동 이동
