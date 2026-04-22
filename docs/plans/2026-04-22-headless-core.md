# Headless Core 분리 플랜

## Context

WZ-Grid는 현재 Vue 전용 라이브러리. React 등 다른 프레임워크에서도 사용 가능하도록 Headless 코어를 분리하고, 프레임워크별 래퍼 패키지를 제공하는 구조로 전환한다.

**최종 패키지 구조:**
```
@paxfam/wz-grid-core   ← 순수 TS (로직, 타입, 유틸)
wz-grid-vue             ← Vue 2/3 래퍼 (기존 사용법 100% 유지)
wz-grid-react           ← React 래퍼 (향후)
```

## 목표/범위

### 이번 작업 범위 (Phase 1~3)
1. **모노레포 전환** — pnpm workspace로 `packages/core`, `packages/vue` 분리
2. **코어 패키지 구축** — 타입, 유틸, 컴포저블 로직을 순수 TS로 추출
3. **Vue 래퍼 패키지** — 기존 Vue 컴포넌트가 코어를 import하여 동작. 기존 API 100% 유지

### 범위 밖 (향후)
- React 래퍼 패키지
- Svelte/Solid 등 추가 프레임워크

## 건드릴 파일

### 새로 생성
```
packages/
  core/
    package.json
    tsconfig.json
    vite.config.ts
    src/
      types/         ← src/types/ 이동
      utils/         ← src/utils/ 이동
      composables/   ← 순수 TS 버전 (vue-demi 제거)
      index.ts
  vue/
    package.json
    tsconfig.json
    vite.lib.config.ts
    src/
      components/    ← src/components/ 이동
      composables/   ← Vue 래퍼 (코어 로직 + ref/computed 감싸기)
      i18n/          ← src/i18n/ 이동
      index.ts
```

### 수정
- `package.json` → pnpm workspace 루트로 전환
- `pnpm-workspace.yaml` 생성
- 루트 `tsconfig.json` → project references

### 삭제 (이동 후)
- `src/composables/`, `src/types/`, `src/utils/` (packages/로 이동)

## 코어 분리 전략

### 컴포저블 변환 방식

현재 Vue 컴포저블이 사용하는 `ref`, `computed`, `watch`를 순수 TS로 대체:

| vue-demi API | 코어 대체 |
|---|---|
| `ref<T>(init)` | `State<T>` 클래스 (get/set + onChange 콜백) |
| `computed(() => ...)` | getter 함수 또는 `Derived<T>` |
| `watch(src, cb)` | `subscribe(cb)` 패턴 |
| `reactive({})` | 일반 객체 + Proxy 또는 콜백 |
| `onMounted` 등 | 제거, init()/destroy() 메서드로 대체 |

### 즉시 이동 (Vue 의존성 없음)
- `src/types/*` — 100% 순수 TS
- `src/utils/*` — 순수 함수 (브라우저 API만 주입 분리)
- `usePlugins`, `usePerformance`, `useClipboard`

### 리팩토링 후 이동 (ref/computed만 사용)
- `useSort`, `useFilter`, `useTree`, `useGrouping`, `useMerge`
- `useVirtualScroll`, `useSelection`, `useCheckbox`
- `useColumnDrag`, `useRowDragDrop`, `useUndoRedo`

### DOM/lifecycle 분리 필요
- `useColumnSettings` (onMounted/onBeforeUnmount)
- `useValidation` (watch + onBeforeUnmount)
- `useFocusTrap` (getCurrentInstance + DOM)

## 제약/주의

1. **기존 API 호환성 필수** — `wz-grid-vue` 사용자는 import 경로만 변경. props, events, slots 모두 동일
2. **vue-demi 유지** — Vue 래퍼는 계속 vue-demi로 Vue 2/3 동시 지원
3. **테스트 통과** — 기존 66개 테스트가 코어 또는 Vue 래퍼에서 모두 통과해야 함
4. **데모 앱 유지** — `npm run dev`로 기존 데모 정상 동작
5. **단계적 진행** — 한 번에 전환하지 않고, Phase별로 검증하며 진행

## 검증

- [ ] `packages/core` 빌드 성공 (순수 TS, Vue 의존성 0)
- [ ] `packages/vue` 빌드 성공 (기존 dist와 동일한 출력)
- [ ] 기존 테스트 66개 전부 통과
- [ ] `npm run dev` 데모 앱 정상 동작
- [ ] `packages/core/package.json`에 vue/vue-demi 의존성 없음
