# 플러그인

WZ-Grid 플러그인 시스템을 사용하면 그리드의 라이프사이클 훅에 로직을 주입할 수 있습니다. 로깅, 분석, 커스텀 데이터 가공 등에 활용합니다.

## plugins prop

```vue
<WZGrid
  :columns="columns"
  :rows="rows"
  :plugins="[myPlugin, analyticsPlugin]"
/>
```

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :---: | :--- |
| `plugins` | `WZGridPlugin[]` | `[]` | 설치할 플러그인 배열. 순서대로 install이 호출됩니다. |

---

## WZGridPlugin 인터페이스

```ts
import type { WZGridPlugin } from 'wz-grid'

const myPlugin: WZGridPlugin = {
  name: 'my-plugin',           // 고유 이름 (오류 메시지에 사용)
  install(ctx) {               // PluginContext를 받아 훅 등록
    ctx.on('afterSort', ({ rows, sortConfigs }) => {
      console.log('정렬 완료:', rows.length, '건', sortConfigs)
    })
  }
}
```

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `name` | `string` | 플러그인 고유 이름. 에러 발생 시 콘솔 메시지에 표시됩니다. |
| `install` | `(context: PluginContext) => void` | 플러그인 초기화 함수. `context.on()`으로 훅을 등록합니다. |

---

## PluginContext API

`install(ctx)` 함수에서 사용할 수 있는 메서드입니다.

```ts
interface PluginContext {
  on<H extends PluginHook>(hook: H, callback: (data: PluginHookData[H]) => void): void;
}
```

| 메서드 | 설명 |
| :--- | :--- |
| `on(hook, callback)` | 라이프사이클 훅에 콜백을 등록합니다. 동일 훅에 여러 콜백 등록 가능. |

---

## 라이프사이클 훅

### afterSort

정렬이 적용된 후 호출됩니다.

```ts
ctx.on('afterSort', ({ rows, sortConfigs }) => {
  // rows: 정렬 결과 GridRow[]
  // sortConfigs: 현재 활성화된 SortConfig[] — [{ key: 'name', order: 'asc' }, ...]
  console.log(`${rows.length}건 정렬됨`, sortConfigs)
})
```

| 데이터 키 | 타입 | 설명 |
| :--- | :--- | :--- |
| `rows` | `GridRow[]` | 정렬이 적용된 전체 rows |
| `sortConfigs` | `SortConfig[]` | 현재 활성화된 정렬 기준 목록 |

### afterFilter

필터가 적용된 후 호출됩니다.

```ts
ctx.on('afterFilter', ({ rows }) => {
  // rows: 필터 결과 GridRow[]
  console.log(`필터 후 ${rows.length}건 표시`)
})
```

| 데이터 키 | 타입 | 설명 |
| :--- | :--- | :--- |
| `rows` | `GridRow[]` | 필터가 적용된 rows |

### beforeRender

렌더링 직전에 호출됩니다. 화면에 표시될 아이템 목록(가상 스크롤 범위 내)을 받습니다.

```ts
ctx.on('beforeRender', ({ items }) => {
  // items: 현재 렌더링될 GridItem[] (DataItem | GroupHeader | SubtotalItem)
  console.log(`${items.length}개 아이템 렌더링 예정`)
})
```

| 데이터 키 | 타입 | 설명 |
| :--- | :--- | :--- |
| `items` | `GridItem[]` | 렌더링 대상 아이템 목록 |

### cellRender

각 셀이 렌더링될 때 호출됩니다. 셀 단위 로깅이나 분석에 활용합니다.

```ts
ctx.on('cellRender', ({ row, colKey, value }) => {
  // row: 해당 행 데이터
  // colKey: 컬럼 key
  // value: 셀 값
})
```

| 데이터 키 | 타입 | 설명 |
| :--- | :--- | :--- |
| `row` | `GridRow` | 해당 행 데이터 |
| `colKey` | `string` | 컬럼 key |
| `value` | `any` | 셀의 현재 값 |

> `cellRender` 훅은 행 수 × 컬럼 수만큼 호출됩니다. 대량 데이터에서는 성능에 주의하세요.

---

## 에러 격리

플러그인 훅에서 예외가 발생해도 그리드 동작에는 영향을 주지 않습니다. 에러는 콘솔에 기록됩니다.

```
[WZGrid plugin] "afterSort" hook error: ...
```

플러그인 설치(`install`) 자체에서 에러가 발생하면 해당 플러그인만 건너뜁니다.

```
[WZGrid plugin] "my-plugin" 설치 실패: ...
```

---

## plugins 배열 변경 시 동작

`plugins` prop이 변경되면 기존에 등록된 모든 훅이 초기화된 후 새 플러그인들이 다시 설치됩니다. 이는 hot-reload 환경에서도 정상 동작합니다.

---

## 커스텀 플러그인 예시

### 로깅 플러그인

```ts
import type { WZGridPlugin } from 'wz-grid'

export const loggingPlugin: WZGridPlugin = {
  name: 'logging',
  install(ctx) {
    ctx.on('afterSort', ({ rows, sortConfigs }) => {
      console.log('[Grid] 정렬 변경:', sortConfigs.map(s => `${s.key} ${s.order}`).join(', '))
    })

    ctx.on('afterFilter', ({ rows }) => {
      console.log('[Grid] 필터 결과:', rows.length, '건')
    })
  }
}
```

### 분석 플러그인

```ts
import type { WZGridPlugin } from 'wz-grid'

export const analyticsPlugin: WZGridPlugin = {
  name: 'analytics',
  install(ctx) {
    ctx.on('afterSort', ({ sortConfigs }) => {
      // GA, Mixpanel 등 분석 도구에 이벤트 전송
      window.gtag?.('event', 'grid_sort', {
        columns: sortConfigs.map(s => s.key).join(','),
      })
    })

    ctx.on('afterFilter', ({ rows }) => {
      window.gtag?.('event', 'grid_filter', { result_count: rows.length })
    })
  }
}
```

### 플러그인 사용

```vue
<script setup>
import { loggingPlugin } from './plugins/logging'
import { analyticsPlugin } from './plugins/analytics'

const plugins = [loggingPlugin, analyticsPlugin]
</script>

<template>
  <WZGrid :columns="columns" :rows="rows" :plugins="plugins" />
</template>
```
