# 성능 모니터링

`performance` prop을 활성화하면 WZ-Grid가 정렬·필터·렌더링 시간을 측정하고 `@perf` 이벤트로 결과를 전달합니다.

## performance prop

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :performance="true"
  @perf="onPerf"
/>
```

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `performance` | `boolean` | `false` | 성능 측정 활성화. `@perf` 이벤트가 emit됩니다. |

---

## @perf 이벤트

성능 측정이 완료될 때마다 `PerfEntry` 객체가 emit됩니다.

```ts
import type { PerfEntry } from 'wz-grid'

function onPerf(entry: PerfEntry) {
  console.log(entry)
}
```

### PerfEntry 타입

```ts
interface PerfEntry {
  /** 측정 대상 */
  type: 'render' | 'sort' | 'filter';
  /** 소요 시간 (밀리초) */
  duration: number;
  /** 처리된 아이템(행) 수 */
  count: number;
  /** 측정 완료 시각 (Unix timestamp ms) */
  timestamp: number;
}
```

| 필드 | 타입 | 설명 |
| :--- | :--- | :--- |
| `type` | `'render' \| 'sort' \| 'filter'` | 측정 대상 작업 유형 |
| `duration` | `number` | 소요 시간(ms). `performance.now()` 기반 고정밀 측정 |
| `count` | `number` | 처리된 행 수 |
| `timestamp` | `number` | 측정 완료 시각 (`Date.now()`) |

---

## debug 모드와 함께 사용

`debug="true"`를 함께 설정하면 `@perf` 이벤트 발생 시 **브라우저 콘솔에 `console.table`로 결과가 출력**됩니다.

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :performance="true"
  :debug="true"
/>
```

콘솔 출력 예시:

```
┌─────────┬──────────┬──────────────┬───────┐
│ (index) │   type   │      ms      │ count │
├─────────┼──────────┼──────────────┼───────┤
│    0    │  'sort'  │   '1.234'    │ 10000 │
└─────────┴──────────┴──────────────┴───────┘

┌─────────┬──────────┬──────────────┬───────┐
│ (index) │   type   │      ms      │ count │
├─────────┼──────────┼──────────────┼───────┤
│    0    │ 'filter' │   '0.892'    │  847  │
└─────────┴──────────┴──────────────┴───────┘
```

---

## 활용 예시

### 성능 데이터 수집 및 표시

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { PerfEntry } from 'wz-grid'

const perfLog = ref<PerfEntry[]>([])

function onPerf(entry: PerfEntry) {
  perfLog.value = [entry, ...perfLog.value].slice(0, 20) // 최근 20건 유지
}
</script>

<template>
  <WZGrid
    :columns="columns"
    :rows="rows"
    :performance="true"
    @perf="onPerf"
  />

  <table v-if="perfLog.length">
    <thead>
      <tr><th>작업</th><th>소요 시간(ms)</th><th>행 수</th></tr>
    </thead>
    <tbody>
      <tr v-for="(entry, i) in perfLog" :key="i">
        <td>{{ entry.type }}</td>
        <td>{{ entry.duration.toFixed(3) }}</td>
        <td>{{ entry.count }}</td>
      </tr>
    </tbody>
  </table>
</template>
```

### 외부 모니터링 서비스 연동

```ts
function onPerf(entry: PerfEntry) {
  // Datadog, New Relic 등
  window.DD_RUM?.addTiming(`grid.${entry.type}`, entry.duration)

  // 임계값 초과 시 경고
  if (entry.type === 'render' && entry.duration > 100) {
    console.warn(`[Grid] 렌더링 지연: ${entry.duration.toFixed(1)}ms (${entry.count}행)`)
  }
}
```

---

## 프로덕션 환경 주의사항

- `performance` prop은 **개발·QA 환경에서 활용**하고, 프로덕션에서는 비활성화(`false`)를 권장합니다.
- `performance.now()` 호출 자체의 오버헤드는 미미하지만, `@perf` 핸들러에서 무거운 작업을 수행하면 성능이 저하될 수 있습니다.
- 환경 변수로 제어하는 예시:

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :performance="import.meta.env.DEV"
  :debug="import.meta.env.DEV"
/>
```
