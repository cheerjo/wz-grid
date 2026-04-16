# 테스트

WZ-Grid는 [Vitest](https://vitest.dev) + jsdom 환경에서 컴포저블 단위 테스트를 수행합니다.

## 실행

```bash
npm run test            # 1회 실행
npm run test:watch      # watch 모드
npm run test:coverage   # v8 커버리지 리포트
```

## 구조

```
tests/
└── composables/
    ├── useSort.spec.ts
    ├── useFilter.spec.ts
    ├── useMerge.spec.ts
    ├── useTree.spec.ts
    └── useGrouping.spec.ts
```

각 스펙은 해당 컴포저블의 **공개 API만** 검증합니다. 내부 구현 변경 시 깨지지 않도록 DOM 상호작용이 아닌 반응형 상태·computed 결과를 중심으로 작성합니다.

## 공통 패턴

컴포저블 대부분은 getter 함수를 의존으로 받습니다. 런타임 변화가 computed에 반영되어야 하는 케이스는 `ref()`를 사용해 반응성을 확보합니다.

```ts
import { ref } from 'vue-demi';
import { useMerge } from '../../src/composables/useMerge';

const rows = ref([{ id: 1, region: 'A' }, { id: 2, region: 'A' }]);
const { getMerge } = useMerge(
  () => rows.value.map(row => ({ type: 'data' as const, row })),
  () => cols,
  () => ['region'],
  () => null,
);

rows.value = [{ id: 3, region: 'B' }, ...rows.value];
// computed가 자동 재계산됨
```

## Vitest 설정

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 테스트 환경에서는 vue-demi → Vue 3 네임스페이스로 직접 alias
      'vue-demi': path.resolve(__dirname, 'node_modules/vue-demi/lib/v3/index.mjs'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
});
```

Vue 2/3 호환을 위해 소스는 `vue-demi`를 import하지만, 테스트 환경에서는 Vue 3 네임스페이스를 그대로 사용합니다.

## 새 컴포저블 추가 시

1. `src/composables/useXxx.ts` 구현
2. `tests/composables/useXxx.spec.ts`에 최소 2~3개의 스모크 테스트 추가 (기본 동작, 엣지 케이스, 반응성)
3. `npm run test`로 통과 확인
4. PR에 스펙 변경 요약 포함

## CI

GitHub Actions에서 모든 PR에 대해 자동으로 `typecheck → test → build:lib` 파이프라인이 실행됩니다. CI가 fail하면 머지할 수 없습니다. 자세한 내용은 `.github/workflows/ci.yml`을 참고하세요.
